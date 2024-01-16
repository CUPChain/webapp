// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AppointmentTokens is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    // Appointments need to store their type (category)
    mapping (uint256 => uint) tokenIdToCategory;
    address prescriptionsContract;

    constructor(address initialOwner, address _prescriptionsContract)
        ERC721("Appointment", "APP")
        Ownable(initialOwner)
    {
        prescriptionsContract = _prescriptionsContract;
    }

    function safeMint(uint256 tokenId, string memory uri, uint category)
        public
    {
        // NEED A CHECK TO ONLY ALLOW HOSPITALS
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        tokenIdToCategory[tokenId] = category;
        // instead of doing this on each mint, we could make it so
        // that as soon as an hospital is created, it calls setApprovalForAll
        approve(prescriptionsContract, tokenId);
    }

    // Get category of appointment (type of appointment)
    function getAppointmentCategory(uint256 tokenId) public view returns (uint) {
        return tokenIdToCategory[tokenId];
    }

    // The following functions are overrides required by Solidity.

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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}