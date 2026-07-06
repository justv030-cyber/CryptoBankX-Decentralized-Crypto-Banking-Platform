// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InterestRateModel.sol";

contract LendingPool {
    IERC20 public token;
    InterestRateModel public interestRateModel;

    event Debug(uint256 amount);

    constructor(address _token, address _interestRateModel) {
        token = IERC20(_token);

        interestRateModel = InterestRateModel(_interestRateModel);
    }

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;
    mapping(address => uint256) public borrowTime;

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

        borrowTime[msg.sender] = block.timestamp;

        require(token.transfer(msg.sender, amount), "Transfer failed");
    }

    // function repay(uint256 amount) external {
    //     require(amount > 0, "Amount must be greater than zero");
    //     require(debt[msg.sender] >= amount, "Insufficient debt");

    //     require(
    //         token.transferFrom(msg.sender, address(this), amount),
    //         "Transfer Failed"
    //     );

    //     debt[msg.sender] -= amount;
    // }

   function repay(uint256 amount) external {
    require(amount > 0, "Amount must be greater than zero");

    require(debt[msg.sender] > 0, "No debt available");

    uint256 interest = interestRateModel.calculateInterest(
        debt[msg.sender],
        block.timestamp - borrowTime[msg.sender]
    );

    uint256 totalRepay = debt[msg.sender] + interest;

    emit Debug(totalRepay);

    require(
        token.transferFrom(msg.sender, address(this), totalRepay),
        "Transfer Failed"
    );

    debt[msg.sender] = 0;
}

    function getPosition(
        address user
    ) external view returns (uint256, uint256) {
        return (collateral[user], debt[user]);
    }

    function isSafe(address user) external view returns (bool) {
        return collateral[user] >= debt[user] * 2;
    }

    function calculateInterest(address user) public view returns (uint256) {
        uint256 timePassed = block.timestamp - borrowTime[user];

        return interestRateModel.calculateInterest(debt[user], timePassed);
    }

    function getTotalDebt(address user) external view returns (uint256) {
        return debt[user] + calculateInterest(user);
    }
}
