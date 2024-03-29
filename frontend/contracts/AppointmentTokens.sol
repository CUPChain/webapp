// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PrescriptionTokens.sol";

/**
 * @title AppointmentTokens
 * @dev This contract represents a collection of appointment tokens.
 * Each appointment token is associated with a type of medical exam (category),
 * a hash of its metadata, and optionally with the id of the prescription token that was given to the hospital 
 * in exchange for the appointment.
 * The contract allows minting appointment tokens, granting and revoking minting role to hospitals,
 * getting the list of tokens owned by an address, getting the category of an appointment token,
 * and getting the metadata hash of an appointment token.
 * @notice This contract is used by hospitals to mint appointment tokens and transfer them to 
 * patients for prescription token that has the same category.
 */
contract AppointmentTokens is ERC721, ERC721Enumerable, ERC721Burnable, ERC721Pausable, AccessControl {
    /// @notice Address of the PrescriptionTokens contract, which will be allowed to transfer appoinment tokens for hospitals
    address private prescriptionsContract;
    /// @notice Category of the appointment token. It indicates the type of medical exam represented by the appointment
    mapping (uint256 => uint16) private tokenIdToCategory;
    /// @notice Metadata hash of the appointment token
    mapping (uint256 => bytes32) private tokenIdToHash;
    /// @notice Prescription token that was exchanged for the appointment token
    mapping (uint256 => uint256) private tokenIdToPrescriptionId;

    /// @notice Role for minting appointment tokens
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Emitted when an appointment token is being minted.
     *
     * `tokenId` is the id of the token that is being minted.
     */
    event MintedAppointment(uint256 tokenId);
    /**
     * @dev Emitted when an appointment is being cancelled.
     *
     * `appointmentId` is the id of the appointment token
     * that is being returned to the ospital in exchange for
     * the prescription token identified by `prescriptionId`.
     */
    event CancelledAppointment(uint256 appointmentId, uint256 prescriptionId);
    /// @dev Throws if the function is being called directly, and not by another contract.
    error NonContractCaller();
    /// @dev Throws if the function being called is disabled.
    error DisabledFunction();

    /**
     * @dev Constructor function that initializes the PrescriptionTokens contract.
     * It sets the name and symbol for the token and grants the DEFAULT_ADMIN_ROLE to the contract deployer.
     * Also sets the deployer address.
     */
    constructor() ERC721("Appointment", "APP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Sets the address of the PrescriptionTokens contract. Only the Admin can call this function.
     */
    function setPrescriptionsAddress(address contractAddress) public whenNotPaused {
        _checkRole(DEFAULT_ADMIN_ROLE);
        prescriptionsContract = contractAddress;
    }

    /**
     * @dev Mints a new appointment token with the specified tokenId, metadataHash, and category.
     * Only a minter can call this function.
     * 
     * @param tokenId The unique identifier for the appointment token.
     * @param metadataHash The hash of the metadata associated with the appointment token.
     * @param category The category of the appointment token.
     */
    function safeMint(uint256 tokenId, bytes32 metadataHash, uint16 category) public {
        _checkRole(MINTER_ROLE);
        _safeMint(msg.sender, tokenId);
        tokenIdToCategory[tokenId] = category;
        tokenIdToHash[tokenId] = metadataHash;

        emit MintedAppointment(tokenId);
    }

    /**
     * @dev Retrieves the list of appointment tokens id owned by the function caller
     * along with their associated categories and metadata hashes.
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
     * @dev Retrieves the category of the specified token.
     * 
     * @param tokenId The ID of the token.
     * @return The category of the token.
     */
    function getCategory(uint256 tokenId) public view returns (uint16) {
        return tokenIdToCategory[tokenId];
    }

    /**
     * @dev Retrieves the metadata hash of the specified token.
     * 
     * @param tokenId The ID of the token.
     * @return The metadata hash of the token.
     */
    function getHash(uint256 tokenId) public view returns (bytes32) {
        return tokenIdToHash[tokenId];
    }

    /**
     * @dev This function is used to book an appointment by transferring the appointment token to the
     * address of the patient and saving the id of the prescription token that was exchanged for the appointment.
     * It is used by the PrescriptionTokens contract while exchanging prescription and appointment tokens.
     * 
     * @param from The address of the token owner.
     * @param to The address of the recipient.
     * @param tokenId The ID of the appointment token to be transferred.
     * @param prescriptionId The ID of the prescription used by the patient to book the appointment.
     */
    function exchangeForPrescription(address from, address to, uint256 tokenId, uint256 prescriptionId) public whenNotPaused{
        if (msg.sender != prescriptionsContract) revert NonContractCaller();
        _safeTransfer(from, to, tokenId);
        tokenIdToPrescriptionId[tokenId] = prescriptionId;
    }

    /**
     * @dev Cancels an appointment by transferring the appointment token back to the hospital and exchanging it
     * for the prescription token that was used to book the appointment.
     * 
     * @param appointmentToken The token ID of the appointment to be canceled.
     */
    function cancelAppointment(uint256 appointmentToken) public whenNotPaused {
        uint256 prescription = tokenIdToPrescriptionId[appointmentToken];
        address hospital = PrescriptionTokens(prescriptionsContract).ownerOf(prescription);

        _safeTransfer(msg.sender, hospital, appointmentToken);
        PrescriptionTokens(prescriptionsContract).givePrescriptionBack(hospital, msg.sender, prescription);

        emit CancelledAppointment(appointmentToken, prescription);
    }

    /**
     * @dev Overrides the transfer function from ERC721 contract to prevent users from calling it directly.
     * 
     */
    function transferFrom(address, address, uint256) 
        public virtual 
        override(ERC721, IERC721)
    {
        revert DisabledFunction();
    }
    
    /*
     * @dev Pauses the contract. Only the Admin can call this function.
     */
    function pause() public {
        _checkRole(DEFAULT_ADMIN_ROLE);
        _pause();
    }

    /*
     * @dev Unpauses the contract. Only the Admin can call this function.
     */
    function unpause() public {
        _checkRole(DEFAULT_ADMIN_ROLE);
        _unpause();
    }

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
        override(ERC721, ERC721Enumerable, ERC721Pausable)
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
     * @dev Checks if the contract supports a given interface by calling the corresponding function in the parent contracts.
     * 
     * @param interfaceId The interface identifier.
     * @return A boolean value indicating whether the contract supports the given interface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}