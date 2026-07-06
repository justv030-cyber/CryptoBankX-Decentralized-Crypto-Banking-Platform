// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InterstRateModel {
    uint256 public baseRate;
    uint256 public multiplier;

    constructor(uint256 _baseRate, uint256 _multiplier) {
        baseRate = _baseRate;
        multiplier = _multiplier;
    }

    function calculateInterest(
        uint256 principal,
        uint256 time
    ) external view returns (uint256) {
        uint256 interest = (principal * baseRate * time) / 365 days;
        return interest;
    }

    function updateRates(uint256 _baseRate, uint256 _multiplier) external {
        baseRate = _baseRate;
        multiplier = _multiplier;
    }
}
