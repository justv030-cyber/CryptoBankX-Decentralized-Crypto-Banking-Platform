// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LendingPool.sol";

contract LiquidationManager {
    LendingPool public lendingPool;

    constructor(address _pool) {
        lendingPool = LendingPool(_pool);
    }

    function liquidate(address user) external {
        require(!lendingPool.isSafe(user), "User position is healthy");

        (, uint256 debtAmount) = lendingPool
            .getPosition(user);

        require(debtAmount > 0, "User has no debt");

        lendingPool.executeLiquidation(user,msg.sender);

    }
}
