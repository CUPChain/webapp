// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PrescriptionTokens.sol";

/**
 * @title AppointmentTokens
 * @dev This contract represents a collection of appointment tokens.
 * It extends ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, and AccessControl contracts.
 * Each appointment token is associated with a category and a metadata hash.
 * The contract allows minting appointment tokens, granting and revoking minting role to hospitals,
 * getting the list of tokens owned by an address, getting the category of an appointment token,
 * and getting the category and metadata hash of an appointment token.
 * @notice This contract is used by hospitals to mint appointment tokens and transfer them to 
 * patients which have the corresponding prescription token.
 */
contract AppointmentTokens is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, AccessControl {
    address prescriptionsContract; // Address of Prescription Tokens that will be allowed to transfer appoinment tokens
    mapping (uint256 => uint16) private tokenIdToCategory; // Category of the appointment token
    mapping (uint256 => bytes32) private tokenIdToHash; // Metadata hash of the appointment token
    mapping (uint256 => uint256) private tokenIdToPrescriptionId; // Prescription token that was exchanged for the appointment token
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Role for minting appointment tokens
    address private deployer; // Address of the contract deployer

    /**
     * @dev Initializes the AppointmentTokens contract.
     * 
     * @param _prescriptionsContract The address of the Prescriptions contract.
     */
    constructor(address _prescriptionsContract)
        ERC721("Appointment", "APP")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        prescriptionsContract = _prescriptionsContract;
        deployer = msg.sender;
    }

    /**
     * @dev Mints a new appointment token with the specified tokenId, metadataHash, and category.
     * Only a minter can call this function.
     * 
     * @param tokenId The unique identifier for the appointment token.
     * @param metadataHash The hash of the metadata associated with the appointment token.
     * @param category The category of the appointment token.
     */
    function safeMint(uint256 tokenId, bytes32 metadataHash, uint16 category)
        public
    {
        _checkRole(MINTER_ROLE);
        _safeMint(msg.sender, tokenId);
        tokenIdToCategory[tokenId] = category;
        tokenIdToHash[tokenId] = metadataHash;
    }

    /**
     * @dev Retrieves the tokens owned by the caller.
     * @notice This function is used to get the list of appointment tokens id owned by the function caller.
     * 
     * @return ids An array of token IDs owned by the caller.
     * @return hashes An array of token hashes corresponding to the token IDs.
     * @return categories An array of token categories corresponding to the token IDs.
     */
    function getMyTokens() public view returns (uint[] memory ids, bytes32[] memory hashes, uint16[] memory categories) {
        uint balance = balanceOf(msg.sender);
        ids = new uint[](balance);
        hashes = new bytes32[](balance);
        categories = new uint16[](balance);

        for (uint i = 0; i < balanceOf(msg.sender); i++) {
            ids[i] = tokenOfOwnerByIndex(msg.sender, i);
            hashes[i] = tokenIdToHash[ids[i]];
            categories[i] = tokenIdToCategory[ids[i]];
        }

        return (ids, hashes, categories);
    }

    /**
     * @dev Returns the category of the specified token.
     * @notice This function is used to get the category of the appointment token (type of appointment).
     * 
     * @param tokenId The ID of the token.
     * @return The category of the token.
     */
    function getCategory(uint256 tokenId) public view returns (uint16) {
        return tokenIdToCategory[tokenId];
    }

    /**
     * @dev Retrieves the token information for a given token ID.
     * @notice This function is used to get the metadata hash of the appointment token(type of medical appointment).
     * 
     * @param tokenId The ID of the token to retrieve.
     * @return The metadata hash associated with the token.
     */
    function getHash(uint256 tokenId) public view returns (bytes32) {
        return tokenIdToHash[tokenId];
    }

    /**
     * @dev Exchanges an appointment token for a prescription.
     * @notice This function is used to book an appointment by transferring prescription and appointment tokens between
     * addresses of the patient who own the prescription and of hospital which own the appointment.
     * 
     * @param from The address of the token owner.
     * @param to The address of the recipient.
     * @param tokenId The ID of the appointment token to be transferred.
     * @param prescriptionId The ID of the prescription associated with the token.
     */
    function exchangeForPrescription(address from, address to, uint256 tokenId, uint256 prescriptionId) public {
        safeTransferFrom(from, to, tokenId);
        tokenIdToPrescriptionId[tokenId] = prescriptionId;
    }

    /**
     * @dev Cancels an appointment by transferring the appointment token back to the hospital and exchanging it for the corresponding prescription token.
     * 
     * @param appointmentToken The token ID of the appointment to be canceled.
     */
    function cancelAppointment(uint256 appointmentToken) public {
        uint256 prescription = tokenIdToPrescriptionId[appointmentToken];
        address hospital = PrescriptionTokens(prescriptionsContract).ownerOf(prescription);

        safeTransferFrom(msg.sender, hospital, appointmentToken);
        // The hospital has to have approved the AppointmentTokens contract to transfer the prescription token
        // For this reason, when an hospital creates an account on the blockchain, it has to call setApprovalForAll in PrescriptionTokens
        // This is the only function that allows this contract to transfer prescriptions,
        // and it only exchanges them for the appointment that was made with them.
        PrescriptionTokens(prescriptionsContract).safeTransferFrom(hospital, msg.sender, prescription);
    }

    // The following functions are overrides required by Solidity.

    /**
     * @dev Updates the ownership of a token and returns the address of the new owner.
     * This function overrides the internal _update function from ERC721 and ERC721Enumerable contracts.
     * 
     * @param to The address to transfer the token ownership to.
     * @param tokenId The ID of the token to be transferred.
     * @param auth The address of the authorized caller.
     * @return The address of the new owner.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Internal function to increase the balance of a specific account.
     * Overrides the _increaseBalance function from ERC721 and ERC721Enumerable contracts.
     * 
     * @param account The address of the account to increase the balance for.
     * @param value The amount to increase the balance by.
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Returns the URI for a given token ID.
     * 
     * @param tokenId The ID of the token.
     * @return A string representing the URI of the token.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Checks if the contract supports a given interface by calling the corresponding function in the parent contracts.
     * 
     * @param interfaceId The interface identifier.
     * @return A boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Terminate the contract. Only the deployer can call this function.
     * 
     * 
     */
    function terminate() public {
        if (msg.sender == deployer) {
            selfdestruct(payable(deployer));
        }
    }
}