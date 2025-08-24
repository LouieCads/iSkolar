// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

contract CredentialRegistry is AccessControl, Pausable {
    /*
     * Role Structure:
     * - DEFAULT_ADMIN_ROLE: Can manage the contract, add/remove issuers, pause/unpause
     * - ISSUER_ROLE: Schools that can issue and revoke credentials
     *
     * Note: Admin is not automatically an issuer to maintain proper separation of concerns
     */
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE"); // schools only

    struct Credential {
        address student;
        address issuer;
        bytes32 docHash; // keccak256 hash of file or content
        string schema; // "transcript", "certificate", etc.
        string metadataURI; // IPFS/Azure URL (no PII if possible)
        uint64 issuedAt;
        bool revoked;
    }

    // credentialId -> Credential
    mapping(bytes32 => Credential) public credentials;

    // docHash -> credentialId (one credential per docHash)
    mapping(bytes32 => bytes32) public docHashToId;

    // student -> array of credential IDs
    mapping(address => bytes32[]) public studentCredentials;

    // issuer -> array of credential IDs
    mapping(address => bytes32[]) public issuerCredentials;

    // Counter for unique credential IDs
    uint256 private _credentialCounter;

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

    constructor(address admin) {
        if (admin == address(0)) revert CredentialRegistry__InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        // Admin can manage issuers but is not an issuer by default
        // Schools will be granted ISSUER_ROLE by admin
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Issue a credential
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
        studentCredentials[student].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);

        emit CredentialIssued(
            credentialId,
            student,
            msg.sender,
            docHash,
            schema,
            metadataURI
        );
    }

    function revokeCredential(
        bytes32 credentialId,
        string calldata reason
    ) external whenNotPaused {
        Credential storage cred = credentials[credentialId];
        if (cred.issuer == address(0))
            revert CredentialRegistry__CredentialNotFound();
        if (!hasRole(ISSUER_ROLE, msg.sender) && msg.sender != cred.issuer)
            revert CredentialRegistry__NotAuthorized();
        if (cred.revoked) revert CredentialRegistry__AlreadyRevoked();

        cred.revoked = true;

        // Clear the docHash mapping to prevent confusion
        delete docHashToId[cred.docHash];

        emit CredentialRevoked(credentialId, msg.sender, cred.docHash, reason);
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
     * @notice Get all credentials for a specific student
     * @param student Student address
     * @return Array of credential IDs
     */
    function getStudentCredentials(
        address student
    ) external view returns (bytes32[] memory) {
        if (student == address(0)) revert CredentialRegistry__InvalidAddress();
        return studentCredentials[student];
    }

    /**
     * @notice Get all credentials issued by a specific issuer
     * @param issuer Issuer address
     * @return Array of credential IDs
     */
    function getIssuerCredentials(
        address issuer
    ) external view returns (bytes32[] memory) {
        if (issuer == address(0)) revert CredentialRegistry__InvalidAddress();
        return issuerCredentials[issuer];
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

    // Admin: add/remove authorized issuers (schools/admins)
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

    /**
     * @notice Allow admin to grant themselves ISSUER_ROLE if needed (for testing/emergency)
     * @dev This gives admin flexibility while maintaining proper role separation
     */
    function adminGrantSelfIssuerRole() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, msg.sender);
    }
}
