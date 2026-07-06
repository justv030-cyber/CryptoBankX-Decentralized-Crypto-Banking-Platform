// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    // ------------- statet variables -------------

    uint256 private tokenPrice;

    // -------------- events ----------------

    event PriceUpdated(uint256 oldPrice, uint256 newPrice);

    // ============================================================
    // Constructor
    // ============================================================

   constructor(
        uint256 initialPrice,
        address initialOwner
    ) Ownable(initialOwner) {
        require(initialPrice > 0, "Invalid price");

        tokenPrice = initialPrice;
    }
}
