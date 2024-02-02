// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

/**
 * @title AppointmentContract
 * @dev Interface for interacting with the AppointmentContract.
 */
interface AppointmentContract {
    /**
     * @dev Transfers the ownership of a token from one address to another address.
     * @param from The current owner of the token.
     * @param to The new owner of the token.
     * @param tokenId The ID of the token being transferred.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Gets the category of a token.
     * @param tokenId The ID of the token.
     * @return The category of the token.
     */
    function getCategory(uint256 tokenId) external view returns (uint16);
}
