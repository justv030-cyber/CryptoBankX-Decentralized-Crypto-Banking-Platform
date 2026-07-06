// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Counter Demo Contract
/// @author Harshil Thummar
/// @notice Demo contract for learning Hardhat, testing and deployment.
contract Counter {

    uint256 private count;

    event CounterIncremented(address indexed user, uint256 newValue);
    event CounterDecremented(address indexed user, uint256 newValue);
    event CounterReset(address indexed user);

    error CounterAlreadyZero();

    constructor() {
        count = 0;
    }

    function increment() external {
        count++;

        emit CounterIncremented(msg.sender, count);
    }

    function decrement() external {
        if (count == 0) {
            revert CounterAlreadyZero();
        }

        count--;

        emit CounterDecremented(msg.sender, count);
    }

    function reset() external {
        count = 0;

        emit CounterReset(msg.sender);
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}