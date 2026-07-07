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

    function updatePrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Please Enter Valid Price");
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    function getPrice() external view returns (uint256) {
        return tokenPrice;
    }
}
