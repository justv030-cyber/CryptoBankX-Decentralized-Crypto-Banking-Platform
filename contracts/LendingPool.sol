// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./InterestRateModel.sol";
import "./PriceOracle.sol";
import "hardhat/console.sol";


contract LendingPool is ReentrancyGuard, Pausable {
    // ------------------------------   state variables -----------------------------------------------------

    IERC20 public token;
    InterestRateModel public interestRateModel;
    PriceOracle public priceOracle;
    address public liquidationManager;
    address public owner;

    // -------------------------------   modifiers -----------------------------------------------------

    modifier onlyLiquidationManager() {
        require(
            msg.sender == liquidationManager,
            "Only Liquidation Manager can call this function"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    //  ------------------------------   events -----------------------------------------------------

    event Debug(uint256 amount);

    event Liquidated(
        address indexed borrower,
        address indexed liquidator,
        uint256 debtPaid,
        uint256 collateralSeized
    );

    event CollateralWithdrawn(address indexed user, uint256 amount);

    event CollateralDeposited(address indexed user, uint256 amount);

    event Borrowed(address indexed user, uint256 amount);

    event Repaid(address indexed user, uint256 amount);

    event DebugRepay(
        uint256 debt,
        uint256 interest,
        uint256 totalRepay,
        uint256 amount
    );

    ////// ---------------------------counstrcuctor -----------------------------

    constructor(address _token, address _interestRateModel, address _oracle) {
        token = IERC20(_token);

        interestRateModel = InterestRateModel(_interestRateModel);
        priceOracle = PriceOracle(_oracle);

        owner = msg.sender;
    }

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;
    mapping(address => uint256) public borrowTime;

    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer Failed"
        );

        collateral[msg.sender] += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        uint256 price = priceOracle.getPrice();

        uint256 collateralValue = (collateral[msg.sender] * price) / 1e18;

        uint256 maxBorrow = collateralValue / 2;

        require(amount > 0, "Amount must be greater than zero");
        require(collateral[msg.sender] > 0, "No collateral deposited");
        // require(
        //     collateral[msg.sender] >= amount * 2,
        //     "Insufficient collateral"
        // );

        require(amount <= maxBorrow, "Borrrow Exceed Limit...");
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

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        require(debt[msg.sender] > 0, "No debt available");

        uint256 interest = interestRateModel.calculateInterest(
            debt[msg.sender],
            block.timestamp - borrowTime[msg.sender]
        );

        uint256 totalRepay = debt[msg.sender] + interest;

        emit DebugRepay(debt[msg.sender], interest, totalRepay, amount);

        require(
            token.transferFrom(msg.sender, address(this),totalRepay),
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
        uint256 price = priceOracle.getPrice();

        uint256 collateralValue = (collateral[user] * price) / 1e18;

        return collateralValue >= debt[user] * 2;
    }

    function calculateInterest(address user) public view returns (uint256) {
        uint256 timePassed = block.timestamp - borrowTime[user];

        return interestRateModel.calculateInterest(debt[user], timePassed);
    }

    function getTotalDebt(address user) public view returns (uint256) {
        return debt[user] + calculateInterest(user);
    }

    function executeLiquidation(
        address borrower,
        address liquidator
    ) external onlyLiquidationManager nonReentrant {
        require(debt[borrower] > 0, "Borrower has no debt");
        uint256 collateralAmount = collateral[borrower];

        uint256 debtAmount = getTotalDebt(borrower);

        require(
            token.transferFrom(liquidator, address(this), debtAmount),
            "Transfer Failed"
        );

        require(
            token.transferFrom(liquidator, address(this), collateralAmount),
            "Collateral Transfer Failed"
        );

        debt[borrower] = 0;
        collateral[borrower] = 0;
        borrowTime[borrower] = 0;

        emit Liquidated(borrower, liquidator, debtAmount, collateralAmount);
    }

    function setLiquidationManager(
        address _liquidationManager
    ) external onlyOwner {
        liquidationManager = _liquidationManager;
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(collateral[msg.sender] >= amount, "Insufficient collateral");

        uint256 remainingCollateral = collateral[msg.sender] - amount;

        uint256 price = priceOracle.getPrice();

        uint256 remainingCollateralValue = (remainingCollateral * price) / 1e18;

        require(
            remainingCollateralValue >= getTotalDebt(msg.sender) * 2,
            "Withdrawal would make position unsafe"
        );

        collateral[msg.sender] = remainingCollateral;

        require(
            token.transfer(msg.sender, amount),
            "Transfer Failed Please Try Again Later"
        );

        emit CollateralWithdrawn(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }
}
