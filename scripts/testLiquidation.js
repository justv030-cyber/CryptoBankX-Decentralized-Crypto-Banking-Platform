import { network } from "hardhat";

async function main() {

    console.log("🧪 Starting Liquidation Test...");

    const { ethers } = await network.connect();

    const signers = await ethers.getSigners();

    console.log("Total Signers:", signers.length);

    signers.forEach((s, i) => {
        console.log(i, s.address);
    });

    const owner = signers[0];
    const user = signers[1];
    const liquidator = signers[2];

    console.log("👤 Owner:", owner.address);
    console.log("👤 User:", user.address);
    console.log("👤 Liquidator:", liquidator.address);

    // =====================================================
    // Deploy Token
    // =====================================================

    const BankToken = await ethers.getContractFactory("BankToken");

    const token = await BankToken.deploy();

    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();

    console.log("📍 Token:", tokenAddress);

    // =====================================================
    // Deploy Interest Model
    // =====================================================

    const InterestRateModel =
        await ethers.getContractFactory("InterestRateModel");

    const interest =
        await InterestRateModel.deploy(
            5,
            1
        );

    await interest.waitForDeployment();

    const interestAddress =
        await interest.getAddress();

    console.log(
        "📍 Interest:",
        interestAddress
    );

    // =====================================================
    // Deploy Price Oracle
    // =====================================================

    const PriceOracle =
        await ethers.getContractFactory("PriceOracle");

    const oracle =
        await PriceOracle.deploy(
            ethers.parseUnits("2", 18),
            owner.address
        );

    await oracle.waitForDeployment();

    const oracleAddress =
        await oracle.getAddress();

    console.log(
        "📍 Oracle:",
        oracleAddress
    );

    // =====================================================
    // Deploy LendingPool
    // =====================================================

    const LendingPool =
        await ethers.getContractFactory("LendingPool");

    const lending =
        await LendingPool.deploy(
            tokenAddress,
            interestAddress,
            oracleAddress
        );

    await lending.waitForDeployment();

    const lendingAddress =
        await lending.getAddress();

    console.log(
        "📍 LendingPool:",
        lendingAddress
    );

    // =====================================================
    // Deploy LiquidationManager
    // =====================================================

    const LiquidationManager =
        await ethers.getContractFactory(
            "LiquidationManager"
        );

    const liquidation =
        await LiquidationManager.deploy(
            lendingAddress
        );

    await liquidation.waitForDeployment();

    const liquidationAddress =
        await liquidation.getAddress();

    console.log(
        "📍 LiquidationManager:",
        liquidationAddress
    );

    // =====================================================
    // Link Liquidation Manager
    // =====================================================

    await lending.setLiquidationManager(
        liquidationAddress
    );

    console.log(
        "✅ Liquidation Manager Linked"
    );

    // =====================================================
    // Transfer Tokens
    // =====================================================

    await token.transfer(
        user.address,
        ethers.parseUnits("1000", 18)
    );

    await token.transfer(
        liquidator.address,
        ethers.parseUnits("1000", 18)
    );

    // =====================================================
    // Deposit
    // =====================================================

    const collateral =
        ethers.parseUnits("100", 18);

    await token
        .connect(user)
        .approve(
            lendingAddress,
            collateral
        );

    await lending
        .connect(user)
        .depositCollateral(
            collateral
        );

    console.log(
        "💰 Collateral Deposited"
    );

    // =====================================================
    // Borrow
    // =====================================================

    const borrow =
        ethers.parseUnits("90", 18);

    await lending
        .connect(user)
        .borrow(
            borrow
        );

    console.log(
        "🏦 Borrow Success"
    );

    // =====================================================
    // Price Crash
    // =====================================================

    await oracle.updatePrice(
        ethers.parseUnits("1", 18)
    );

    console.log(
        "📉 Price Dropped"
    );

    const safe =
        await lending.isSafe(
            user.address
        );

    console.log(
        "Safe Position:",
        safe
    );

    // =====================================================
    // Liquidator Approval
    // =====================================================

    const totalDebt =
        await lending.getTotalDebt(
            user.address
        );

    await token.connect(liquidator).approve(
        lendingAddress,
        ethers.MaxUint256
    );  

    console.log(
        "✅ Liquidator Approved"
    );

    // =====================================================
    // Liquidate
    // =====================================================

    await liquidation
        .connect(liquidator)
        .liquidate(
            user.address
        );

    console.log(
        "🔥 Liquidation Successful"
    );

    // =====================================================
    // Final Position
    // =====================================================

    const position =
        await lending.getPosition(
            user.address
        );

    console.log(
        "Debt:",
        position[1].toString()
    );

    console.log(
        "Collateral:",
        position[0].toString()
    );

    console.log(
        "🎉 Liquidation Test Passed"
    );

}

main().catch((err) => {

    console.error(err);

    process.exit(1);

});