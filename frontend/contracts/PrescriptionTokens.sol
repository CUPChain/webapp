// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./AppointmentTokens.sol";

/**
 * @title PrescriptionTokens
 * @dev This contract represents a collection of prescription tokens.
 * The contract provides functions to grant and revoke the MINTER_ROLE to doctors.
 * Additionally, it allows users to get a list of their owned tokens and retrieve 
 * the type of medical exam (category) of a token.
 * Users can exchange prescription tokens for appointment tokens.
 * Users can get back their prescription token if they have an appointment token they do not want anymore.
 * @notice This contract is used by doctors to mint prescription tokens and transfer them to patients.
 * It also allows patient to exchange prescription tokens for appointment tokens.
 */
contract PrescriptionTokens is ERC721, ERC721Enumerable, ERC721Burnable, AccessControl {
    /// @notice Category of the prescription token. It indicates the type of medical exam requested by the prescription
    mapping (uint256 => uint16) private tokenIdToCategory;

    /// @notice Role for minting prescription tokens
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Address of the contract deployer
    address private deployer;

    /**
     * @dev Throws if the categories of the prescription and appointment tokens do not match.
     */
    error CategoriesDontMatch();

    /**
     * @dev Emitted when a prescription token is being minted.
     *
     * `tokenId` is the id of the token that is being minted.
     */
    event MintedPrescription(uint256 tokenId, address recipient);
    /**
     * @dev Emitted when an appointment is being booked.
     *
     * `appointmentId` is the id of the appointment token
     * that is being retrieved from the ospital in exchange for
     * the prescription token identified by `prescriptionId`.
     */
    event BookedAppointment(uint256 prescriptionId, uint256 appointmentId);

    /**
     * @dev Constructor function that initializes the PrescriptionTokens contract.
     * It sets the name and symbol for the token and grants the DEFAULT_ADMIN_ROLE to the contract deployer.
     * Also sets the deployer address.
     */
    constructor() ERC721("Prescription", "PRE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        deployer = msg.sender;
    }

    /**
     * @dev Mints a new token and assigns it to the specified address.
     * Only callers with the MINTER_ROLE can invoke this function.
     * Reverts with an {AccessControlUnauthorizedAccount} error if `msg.sender`
     * is not a minter.
     * 
     * @param to The address to which the token will be assigned.
     * @param tokenId The unique identifier of the token.
     * @param category The category of the token.
     */
    function safeMint(address to, uint256 tokenId, uint16 category) public {
        _checkRole(MINTER_ROLE);
        _safeMint(to, tokenId);
        tokenIdToCategory[tokenId] = category;

        emit MintedPrescription(tokenId, to);
    }

     /**
     * @dev Retrieves the list of tokens owned by the caller along with their categories.
     * 
     * @return ids An array of token IDs owned by the caller.
     * @return categories An array of token categories corresponding to the token IDs.
     */
    function getMyTokens() public view returns (uint[] memory ids, uint16[] memory categories) {
        uint balance = balanceOf(msg.sender);
        ids = new uint[](balance);
        categories = new uint16[](balance);

        for (uint i = 0; i < balanceOf(msg.sender); i++) {
            ids[i] = tokenOfOwnerByIndex(msg.sender, i);
            categories[i] = tokenIdToCategory[ids[i]];
        }

        return (ids, categories);
    }

    /**
     * @dev Retrieves the category of the specified token.
     * 
     * @param tokenId The ID of the token.
     * @return The category associated with the token.
     */
    function getCategory(uint256 tokenId) public view returns (uint16) {
        return tokenIdToCategory[tokenId];
    }

    /**
     * @dev Book an appointment by transferring prescription and appointment tokens between 
     * addresses of the patient who own the prescription and of hospital which own the appointment.
     * @notice This function is used to book an appointment by exchanging a prescription token for an appointment token.
     * 
     * @param prescriptionToken The ID of the prescription token.
     * @param appointmentsContract The address of the appointments contract.
     * @param appointmentToken The ID of the appointment token.
     */
    function makeAppointment(uint256 prescriptionToken, address appointmentsContract, uint256 appointmentToken) public {
        address hospital = AppointmentTokens(appointmentsContract).ownerOf(appointmentToken);

        if (tokenIdToCategory[prescriptionToken] != AppointmentTokens(appointmentsContract).getCategory(appointmentToken)) revert CategoriesDontMatch();
        safeTransferFrom(msg.sender, hospital, prescriptionToken);
        AppointmentTokens(appointmentsContract).exchangeForPrescription(hospital, msg.sender, appointmentToken, prescriptionToken);

        emit BookedAppointment(prescriptionToken, appointmentToken);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) 
        public virtual 
        override(ERC721, IERC721)
    {
        if(msg.sender != address(this)) revert UnathorizedCaller();
        super.safeTransferFrom(from, to, tokenId, data);
    }

    error UnathorizedCaller();

    // The following functions are overrides required by Solidity.

    /**
     * @dev Updates the ownership of a token and returns the address of the new owner.
     * This function is internal and overrides the _update function from ERC721 and ERC721Enumerable.
     * 
     * @param to The address of the new owner.
     * @param tokenId The ID of the token being transferred.
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

    /**
     * @dev Terminate the contract. Only the deployer can call this function.
     * 
     * 
     */
    function terminate() public {
        require(msg.sender == deployer, "You are not the deployer");
        selfdestruct(payable(deployer));
    }
}