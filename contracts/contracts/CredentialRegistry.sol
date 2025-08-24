// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Updated

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

// Custom errors for gas efficiency
error CredentialRegistry__InvalidStudent();
error CredentialRegistry__InvalidDocHash();
error CredentialRegistry__EmptySchema();
error CredentialRegistry__EmptyMetadataURI();
error CredentialRegistry__CredentialAlreadyIssued();
error CredentialRegistry__CredentialNotFound();
error CredentialRegistry__NotAuthorized();
error CredentialRegistry__AlreadyRevoked();
error CredentialRegistry__InvalidAddress();
error CredentialRegistry__DocumentPreviouslyRevoked();
error CredentialRegistry__InvalidPagination();
error CredentialRegistry__EmergencyRevocationPending();
error CredentialRegistry__NoEmergencyRevocationPending();
error CredentialRegistry__TimelockNotExpired();

contract CredentialRegistry is AccessControl, Pausable {
    /*
     * Role Structure:
     * - DEFAULT_ADMIN_ROLE: Can manage the contract, add/remove issuers, pause/unpause
     * - ISSUER_ROLE: Schools that can issue and revoke their own credentials
     * - EMERGENCY_ADMIN_ROLE: Can initiate emergency revocations with timelock
     *
     * Note: Admin is not automatically an issuer to maintain proper separation of concerns
     */
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant EMERGENCY_ADMIN_ROLE = keccak256("EMERGENCY_ADMIN_ROLE");

    // Emergency revocation timelock period (7 days)
    uint256 public constant EMERGENCY_TIMELOCK = 7 days;

    struct Credential {
        address student;
        address issuer;
        bytes32 docHash;
        string schema;
        string metadataURI;
        uint64 issuedAt;
        bool revoked;
    }

    struct EmergencyRevocation {
        bytes32 credentialId;
        uint256 timestamp;
        string reason;
        bool executed;
    }

    // credentialId -> Credential
    mapping(bytes32 => Credential) public credentials;

    // docHash -> credentialId (one credential per docHash)
    mapping(bytes32 => bytes32) public docHashToId;

    // Track revoked document hashes per issuer (scoped revocation)
    // issuer -> docHash -> revoked
    mapping(address => mapping(bytes32 => bool)) public issuerRevokedDocHashes;

    // student -> credential count (for pagination)
    mapping(address => uint256) public studentCredentialCount;

    // issuer -> credential count (for pagination)  
    mapping(address => uint256) public issuerCredentialCount;

    // student -> index -> credentialId (for efficient pagination)
    mapping(address => mapping(uint256 => bytes32)) public studentCredentialByIndex;

    // issuer -> index -> credentialId (for efficient pagination)
    mapping(address => mapping(uint256 => bytes32)) public issuerCredentialByIndex;

    // credentialId -> studentIndex (for efficient removal)
    mapping(bytes32 => uint256) public credentialToStudentIndex;

    // credentialId -> issuerIndex (for efficient removal)
    mapping(bytes32 => uint256) public credentialToIssuerIndex;

    // Emergency revocations with timelock
    mapping(bytes32 => EmergencyRevocation) public emergencyRevocations;

    // Counter for unique credential IDs
    uint256 private _credentialCounter;

    // Maximum items to return in a single pagination call
    uint256 public constant MAX_PAGINATION_LIMIT = 100;

    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed student,
        address indexed issuer,
        bytes32 docHash,
        string schema,
        string metadataURI
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer,
        bytes32 docHash,
        string reason
    );

    event EmergencyRevocationInitiated(
        bytes32 indexed emergencyId,
        bytes32 indexed credentialId,
        address indexed initiator,
        string reason
    );

    event EmergencyRevocationExecuted(
        bytes32 indexed emergencyId,
        bytes32 indexed credentialId
    );

    event EmergencyRevocationCancelled(
        bytes32 indexed emergencyId,
        bytes32 indexed credentialId
    );

    constructor(address admin) {
        if (admin == address(0)) revert CredentialRegistry__InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ADMIN_ROLE, admin);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Issue a credential with scoped document hash validation
     * @param student Student wallet address
     * @param docHash keccak256(file) or keccak256(fileBytes)
     * @param schema e.g., "transcript", "certificate"
     * @param metadataURI pointer to Azure/IPFS (no PII)
     */
    function issueCredential(
        address student,
        bytes32 docHash,
        string calldata schema,
        string calldata metadataURI
    )
        external
        whenNotPaused
        onlyRole(ISSUER_ROLE)
        returns (bytes32 credentialId)
    {
        // Enhanced input validation with custom errors
        if (student == address(0)) revert CredentialRegistry__InvalidStudent();
        if (docHash == bytes32(0)) revert CredentialRegistry__InvalidDocHash();
        if (bytes(schema).length == 0) revert CredentialRegistry__EmptySchema();
        if (bytes(metadataURI).length == 0)
            revert CredentialRegistry__EmptyMetadataURI();
        
        // Check if document was previously revoked by THIS issuer only
        if (issuerRevokedDocHashes[msg.sender][docHash])
            revert CredentialRegistry__DocumentPreviouslyRevoked();
        
        // Check if document is already issued by ANY issuer
        if (docHashToId[docHash] != bytes32(0))
            revert CredentialRegistry__CredentialAlreadyIssued();

        // Create unique credential ID using counter to prevent collisions
        _credentialCounter++;
        credentialId = keccak256(
            abi.encodePacked(msg.sender, student, docHash, _credentialCounter)
        );

        // Store credential
        credentials[credentialId] = Credential({
            student: student,
            issuer: msg.sender,
            docHash: docHash,
            schema: schema,
            metadataURI: metadataURI,
            issuedAt: uint64(block.timestamp),
            revoked: false
        });

        // Update mappings
        docHashToId[docHash] = credentialId;
        
        // Add to student's credentials using pagination-friendly structure
        uint256 studentIndex = studentCredentialCount[student];
        studentCredentialByIndex[student][studentIndex] = credentialId;
        credentialToStudentIndex[credentialId] = studentIndex;
        studentCredentialCount[student]++;

        // Add to issuer's credentials using pagination-friendly structure
        uint256 issuerIndex = issuerCredentialCount[msg.sender];
        issuerCredentialByIndex[msg.sender][issuerIndex] = credentialId;
        credentialToIssuerIndex[credentialId] = issuerIndex;
        issuerCredentialCount[msg.sender]++;

        emit CredentialIssued(
            credentialId,
            student,
            msg.sender,
            docHash,
            schema,
            metadataURI
        );
    }

    /**
     * @notice Revoke a credential (only by original issuer)
     * @param credentialId The credential to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(
        bytes32 credentialId,
        string calldata reason
    ) external whenNotPaused {
        Credential storage cred = credentials[credentialId];
        if (cred.issuer == address(0))
            revert CredentialRegistry__CredentialNotFound();
        
        // Only allow the original issuer to revoke their own credentials
        if (msg.sender != cred.issuer)
            revert CredentialRegistry__NotAuthorized();
        
        if (cred.revoked) revert CredentialRegistry__AlreadyRevoked();

        cred.revoked = true;

        // Mark the document hash as revoked only for this issuer
        issuerRevokedDocHashes[cred.issuer][cred.docHash] = true;

        emit CredentialRevoked(credentialId, msg.sender, cred.docHash, reason);
    }

    /**
     * @notice Initiate emergency revocation (with timelock for admin safety)
     * @param credentialId The credential to revoke
     * @param reason Reason for emergency revocation
     */
    function initiateEmergencyRevocation(
        bytes32 credentialId,
        string calldata reason
    ) external onlyRole(EMERGENCY_ADMIN_ROLE) {
        Credential storage cred = credentials[credentialId];
        if (cred.issuer == address(0))
            revert CredentialRegistry__CredentialNotFound();
        if (cred.revoked) revert CredentialRegistry__AlreadyRevoked();

        bytes32 emergencyId = keccak256(
            abi.encodePacked(credentialId, block.timestamp, msg.sender)
        );

        emergencyRevocations[emergencyId] = EmergencyRevocation({
            credentialId: credentialId,
            timestamp: block.timestamp,
            reason: reason,
            executed: false
        });

        emit EmergencyRevocationInitiated(emergencyId, credentialId, msg.sender, reason);
    }

    /**
     * @notice Execute emergency revocation after timelock period
     * @param emergencyId The emergency revocation ID
     */
    function executeEmergencyRevocation(
        bytes32 emergencyId
    ) external onlyRole(EMERGENCY_ADMIN_ROLE) {
        EmergencyRevocation storage emergency = emergencyRevocations[emergencyId];
        if (emergency.timestamp == 0)
            revert CredentialRegistry__NoEmergencyRevocationPending();
        if (emergency.executed)
            revert CredentialRegistry__AlreadyRevoked();
        if (block.timestamp < emergency.timestamp + EMERGENCY_TIMELOCK)
            revert CredentialRegistry__TimelockNotExpired();

        Credential storage cred = credentials[emergency.credentialId];
        if (cred.revoked) revert CredentialRegistry__AlreadyRevoked();

        cred.revoked = true;
        emergency.executed = true;

        // Mark as revoked by the original issuer to prevent re-issuance
        issuerRevokedDocHashes[cred.issuer][cred.docHash] = true;

        emit EmergencyRevocationExecuted(emergencyId, emergency.credentialId);
        emit CredentialRevoked(emergency.credentialId, msg.sender, cred.docHash, emergency.reason);
    }

    /**
     * @notice Cancel pending emergency revocation
     * @param emergencyId The emergency revocation ID
     */
    function cancelEmergencyRevocation(
        bytes32 emergencyId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        EmergencyRevocation storage emergency = emergencyRevocations[emergencyId];
        if (emergency.timestamp == 0)
            revert CredentialRegistry__NoEmergencyRevocationPending();
        if (emergency.executed)
            revert CredentialRegistry__AlreadyRevoked();

        delete emergencyRevocations[emergencyId];
        emit EmergencyRevocationCancelled(emergencyId, emergency.credentialId);
    }

    function getCredentialByHash(
        bytes32 docHash
    ) external view returns (Credential memory cred, bytes32 credentialId) {
        credentialId = docHashToId[docHash];
        cred = credentials[credentialId];
    }

    function isValid(bytes32 docHash) external view returns (bool) {
        bytes32 id = docHashToId[docHash];
        if (id == bytes32(0)) return false;
        return !credentials[id].revoked;
    }

    /**
     * @notice Get student credentials with pagination
     * @param student Student address
     * @param offset Starting index
     * @param limit Maximum number of items to return (max 100)
     * @return credentialIds Array of credential IDs
     * @return totalCount Total number of credentials for this student
     */
    function getStudentCredentials(
        address student,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory credentialIds, uint256 totalCount) {
        if (student == address(0)) revert CredentialRegistry__InvalidAddress();
        if (limit == 0 || limit > MAX_PAGINATION_LIMIT) 
            revert CredentialRegistry__InvalidPagination();

        totalCount = studentCredentialCount[student];
        
        if (offset >= totalCount) {
            return (new bytes32[](0), totalCount);
        }

        uint256 end = offset + limit;
        if (end > totalCount) {
            end = totalCount;
        }

        uint256 resultLength = end - offset;
        credentialIds = new bytes32[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            credentialIds[i] = studentCredentialByIndex[student][offset + i];
        }
    }

    /**
     * @notice Get issuer credentials with pagination  
     * @param issuer Issuer address
     * @param offset Starting index
     * @param limit Maximum number of items to return (max 100)
     * @return credentialIds Array of credential IDs
     * @return totalCount Total number of credentials for this issuer
     */
    function getIssuerCredentials(
        address issuer,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory credentialIds, uint256 totalCount) {
        if (issuer == address(0)) revert CredentialRegistry__InvalidAddress();
        if (limit == 0 || limit > MAX_PAGINATION_LIMIT)
            revert CredentialRegistry__InvalidPagination();

        totalCount = issuerCredentialCount[issuer];
        
        if (offset >= totalCount) {
            return (new bytes32[](0), totalCount);
        }

        uint256 end = offset + limit;
        if (end > totalCount) {
            end = totalCount;
        }

        uint256 resultLength = end - offset;
        credentialIds = new bytes32[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            credentialIds[i] = issuerCredentialByIndex[issuer][offset + i];
        }
    }

    /**
     * @notice Get student credential count
     * @param student Student address
     * @return Number of credentials for student
     */
    function getStudentCredentialCount(address student) external view returns (uint256) {
        if (student == address(0)) revert CredentialRegistry__InvalidAddress();
        return studentCredentialCount[student];
    }

    /**
     * @notice Get issuer credential count
     * @param issuer Issuer address  
     * @return Number of credentials for issuer
     */
    function getIssuerCredentialCount(address issuer) external view returns (uint256) {
        if (issuer == address(0)) revert CredentialRegistry__InvalidAddress();
        return issuerCredentialCount[issuer];
    }

    /**
     * @notice Check if an address has issuer role
     * @param account Address to check
     * @return True if account has issuer role
     */
    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    /**
     * @notice Get total number of credentials issued
     * @return Total credential count
     */
    function getTotalCredentials() external view returns (uint256) {
        return _credentialCounter;
    }

    /**
     * @notice Get credential by ID
     * @param credentialId The credential ID
     * @return The credential data
     */
    function getCredential(
        bytes32 credentialId
    ) external view returns (Credential memory) {
        Credential memory cred = credentials[credentialId];
        if (cred.issuer == address(0))
            revert CredentialRegistry__CredentialNotFound();
        return cred;
    }

    /**
     * @notice Check if a document hash is revoked by a specific issuer
     * @param issuer The issuer address
     * @param docHash The document hash
     * @return True if revoked by this issuer
     */
    function isDocHashRevokedByIssuer(
        address issuer,
        bytes32 docHash
    ) external view returns (bool) {
        return issuerRevokedDocHashes[issuer][docHash];
    }

    // Admin: add/remove authorized issuers (schools)
    function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (issuer == address(0)) revert CredentialRegistry__InvalidAddress();
        _grantRole(ISSUER_ROLE, issuer);
    }

    function removeIssuer(
        address issuer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (issuer == address(0)) revert CredentialRegistry__InvalidAddress();
        _revokeRole(ISSUER_ROLE, issuer);
    }

    // Emergency admin management
    function addEmergencyAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (admin == address(0)) revert CredentialRegistry__InvalidAddress();
        _grantRole(EMERGENCY_ADMIN_ROLE, admin);
    }

    function removeEmergencyAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (admin == address(0)) revert CredentialRegistry__InvalidAddress();
        _revokeRole(EMERGENCY_ADMIN_ROLE, admin);
    }
}