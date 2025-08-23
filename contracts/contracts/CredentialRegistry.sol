// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

contract CredentialRegistry is AccessControl, Pausable {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE"); // school/admin

    struct Credential {
        address student;
        address issuer;
        bytes32 docHash;       // keccak256 hash of file or content
        string schema;         // "transcript", "certificate", etc.
        string metadataURI;    // IPFS/Azure URL (no PII if possible)
        uint64 issuedAt;
        bool revoked;
    }

    // credentialId -> Credential
    mapping(bytes32 => Credential) public credentials;

    // docHash -> credentialId (one credential per docHash)
    mapping(bytes32 => bytes32) public docHashToId;

    event CredentialIssued(bytes32 indexed credentialId, address indexed student, address indexed issuer, bytes32 docHash, string schema, string metadataURI);
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer, bytes32 docHash, string reason);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin); // admin can issue by default
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

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
    ) external whenNotPaused onlyRole(ISSUER_ROLE) returns (bytes32 credentialId) {
        require(student != address(0), "Invalid student");
        require(docHash != bytes32(0), "Invalid docHash");
        require(docHashToId[docHash] == bytes32(0), "Already issued");

        // Create credential ID from (issuer, student, docHash, block.timestamp)
        credentialId = keccak256(abi.encodePacked(msg.sender, student, docHash, block.timestamp));
        credentials[credentialId] = Credential({
            student: student,
            issuer: msg.sender,
            docHash: docHash,
            schema: schema,
            metadataURI: metadataURI,
            issuedAt: uint64(block.timestamp),
            revoked: false
        });

        docHashToId[docHash] = credentialId;
        emit CredentialIssued(credentialId, student, msg.sender, docHash, schema, metadataURI);
    }

    function revokeCredential(bytes32 credentialId, string calldata reason)
        external
        whenNotPaused
    {
        Credential storage cred = credentials[credentialId];
        require(cred.issuer != address(0), "Not found");
        require(hasRole(ISSUER_ROLE, msg.sender) || msg.sender == cred.issuer, "Not issuer");
        require(!cred.revoked, "Already revoked");

        cred.revoked = true;
        emit CredentialRevoked(credentialId, msg.sender, cred.docHash, reason);
    }

    function getCredentialByHash(bytes32 docHash) external view returns (Credential memory cred, bytes32 credentialId) {
        credentialId = docHashToId[docHash];
        cred = credentials[credentialId];
    }

    function isValid(bytes32 docHash) external view returns (bool) {
        bytes32 id = docHashToId[docHash];
        if (id == bytes32(0)) return false;
        return !credentials[id].revoked;
    }

    // Admin: add/remove authorized issuers (schools/admins)
    function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, issuer);
    }

    function removeIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ISSUER_ROLE, issuer);
    }
}
