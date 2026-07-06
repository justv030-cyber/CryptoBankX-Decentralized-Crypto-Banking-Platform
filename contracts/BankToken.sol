// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BankToken is ERC20 {
    constructor() ERC20("CryptoBank Token", "CBT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
