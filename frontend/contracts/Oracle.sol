// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Oracle {
    mapping (uint256 => bool) private pendingRequests;

    struct Response {
        address providerAddress;
        address callerAddress;
        bool isADoctor;
    }

    mapping (uint256 => Response[]) private idToResponses;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function checkDoctor(address doctor) external return (bool) {
        emit 
    }

    event CheckDoctorRequested()
}