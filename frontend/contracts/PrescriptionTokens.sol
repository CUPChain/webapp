// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
// import "./Oracle.sol"; //TODO: check correctness

interface AppointmentContract {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function getAppointmentCategory(uint256 tokenId) view external returns (uint);
}

contract PrescriptionTokens is ERC721, ERC721Enumerable, ERC721Burnable, AccessControl {
    mapping (uint256 => uint16) private tokenIdToCategory;
    mapping (uint256 => bytes32) private tokenIdToHash;

    // Oracle private oracle; //TODO: check correctness

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC721("Prescription", "PRE"){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantRole(address doctor) public {
        //TODO: check tramite l'oracolo per verificare che l'indirizzo sia realmente di un medico
        // bool isADoctor = oracle.checkDoctor()  //TODO: check correctness
        _grantRole(MINTER_ROLE, doctor);
    }
    
    function revokeRole(address doctor) public {
        //TODO: check anche qui per verificare che il medico non eserciti più la professione ????
        _revokeRole(MINTER_ROLE, doctor);
    }

    function _baseURI() internal view override(ERC721) virtual returns (string memory) {
        //TODO: possiamo mettere url ai metadata qui senza sprecare memoria, supponendo che sia uguale per tutti
        return "https://cupchain.com/prescriptions/";
    }

    function safeMint(address to, uint256 tokenId, bytes32 metadataHash, uint16 category) public {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _safeMint(to, tokenId);
        tokenIdToCategory[tokenId] = category;
        tokenIdToHash[tokenId] = metadataHash;
    }

    // Get list of token ids owned by function caller
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

    // Get category and metadata hash of prescription (type of medical visit needed)
    function getToken(uint256 tokenId) public view returns (uint16, bytes32) {
        return (tokenIdToCategory[tokenId], tokenIdToHash[tokenId]);
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}