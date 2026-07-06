// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingPoo {
    IERC20 public token;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer Failed"
        );

        collateral[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(
            collateral[msg.sender] >= amount * 2,
            "Insufficient collateral"
        );
        debt[msg.sender] += amount;

        require(token.transfer(msg.sender, amount), "Transfer failed");
    }


    function reply(uint256 amount)external{
        require(amount > 0, "Amount must be greater than zero");
        require(debt[msg.sender]>=amount,"Insufficient debt");

        require(token.transferFrom(msg.sender, address(this), amount), "Transfer Failed");

        debt[msg.sender]-=amount;
    }


    function getPosition(address user) external view returns (uint256 ,uint256){
        return (collateral[user], debt[user]);
    }

    function isSafe(address user) external view returns(bool){
        return collateral[user]>=debt[user]*2;
    }
}
