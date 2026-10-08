// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Verifyd
 * @notice A minimal, trustless smart contract for anchoring cryptographic document hashes.
 * @dev Documents are never stored on-chain. Only the 256-bit cryptographic digest (SHA-256)
 *      along with metadata (type, issuer, timestamp) is recorded.
 */
contract Verifyd {
    /// @notice Document record stored on-chain
    struct Document {
        bytes32 documentHash;
        string documentType;
        address issuer;
        uint256 timestamp;
    }

    /// @notice Custom errors for gas efficiency and clear reverts
    error DocumentAlreadyRegistered();
    error InvalidDocumentHash();
    error InvalidDocumentType();
    error DocumentNotFound();

    /// @notice Emitted when a document hash is registered
    /// @param documentHash The SHA-256 fingerprint of the document
    /// @param documentType The classification of the document
    /// @param issuer The address of the transaction submitter
    /// @param timestamp The block timestamp of registration
    event DocumentRegistered(
        bytes32 indexed documentHash,
        string documentType,
        address indexed issuer,
        uint256 timestamp
    );

    /// @notice Mapping from document SHA-256 hash to Document details
    mapping(bytes32 => Document) public documents;

    /**
     * @notice Registers a new document hash on BOT Chain.
     * @dev Caller becomes the recorded issuer. Same hash cannot be registered twice.
     * @param documentHash The 32-byte cryptographic hash of the document.
     * @param documentType The category/type of the document.
     */
    function registerDocument(
        bytes32 documentHash,
        string calldata documentType
    ) external {
        if (documentHash == bytes32(0)) {
            revert InvalidDocumentHash();
        }

        if (bytes(documentType).length == 0) {
            revert InvalidDocumentType();
        }

        if (documents[documentHash].timestamp != 0) {
            revert DocumentAlreadyRegistered();
        }

        uint256 currentTimestamp = block.timestamp;
        address issuer = msg.sender;

        documents[documentHash] = Document({
            documentHash: documentHash,
            documentType: documentType,
            issuer: issuer,
            timestamp: currentTimestamp
        });

        emit DocumentRegistered(
            documentHash,
            documentType,
            issuer,
            currentTimestamp
        );
    }

    /**
     * @notice Retrieves document record by its cryptographic hash.
     * @dev Reverts with DocumentNotFound if the hash has not been registered.
     * @param documentHash The 32-byte cryptographic hash of the document.
     * @return The Document struct containing hash, type, issuer, and timestamp.
     */
    function getDocument(
        bytes32 documentHash
    ) external view returns (Document memory) {
        if (documents[documentHash].timestamp == 0) {
            revert DocumentNotFound();
        }

        return documents[documentHash];
    }

    /**
     * @notice Checks whether a document hash has been registered.
     * @param documentHash The 32-byte cryptographic hash to check.
     * @return True if registered, false otherwise.
     */
    function documentExists(
        bytes32 documentHash
    ) external view returns (bool) {
        return documents[documentHash].timestamp != 0;
    }
}
