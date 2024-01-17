// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface AppointmentContract {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function getAppointmentCategory(uint256 tokenId) view external returns (uint);
}

contract PrescriptionTokens is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    mapping (uint256 => uint16) private tokenIdToCategory;

    constructor(address initialOwner)
        ERC721("Prescription", "PRE")
        Ownable(initialOwner)
    {}

    function safeMint(address to, uint256 tokenId, string memory uri, uint16 category)
        public
        onlyOwner
    {
        // NEED A CHECK TO ONLY ALLOW DOCTORS (oracle)
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenIdToCategory[tokenId] = category;
    }

    // Get list of token ids owned by function caller
    function getMyTokens() public view returns (uint[] memory ids, string[] memory uris, uint16[] memory categories) {
        uint balance = balanceOf(msg.sender);
        ids = new uint[](balance);
        uris = new string[](balance);
        categories = new uint16[](balance);

        for (uint i = 0; i < balanceOf(msg.sender); i++) {
            ids[i] = tokenOfOwnerByIndex(msg.sender, i);
            uris[i] = tokenURI(ids[i]);
            categories[i] = tokenIdToCategory[ids[i]];
        }

        return (ids, uris, categories);
    }

    // Get category of prescription (type of medical visit needed)
    function getPrescriptionCategory(uint256 tokenId) public view returns (uint) {
        return tokenIdToCategory[tokenId];
    }

    // Exchange for appointment token
    function makeAppointment(uint256 prescriptionToken, address appointmentsContract, uint256 appointmentToken, address hospital) public {
        require(tokenIdToCategory[prescriptionToken] == AppointmentContract(appointmentsContract).getAppointmentCategory(appointmentToken));
        safeTransferFrom(msg.sender, hospital, prescriptionToken);
        AppointmentContract(appointmentsContract).safeTransferFrom(hospital, msg.sender, appointmentToken);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}