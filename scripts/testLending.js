import { network } from "hardhat";

async function main() {
    console.log("🧪 Starting LendingPool Test...");

    // 🔌 Connect network
    const { ethers } = await network.connect();

    const [user] = await ethers.getSigners();

    console.log("👤 User:", user.address);


    // ==============================
    // Deploy BankToken
    // ==============================

    const BankToken = await ethers.getContractFactory("BankToken");

    const token = await BankToken.deploy();

    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();

    console.log("📍 Token deployed:", tokenAddress);



    // ==============================
    // Deploy LendingPool
    // ==============================

    const LendingPool = await ethers.getContractFactory("LendingPool");

    // InterestRateModel is required by LendingPool constructor
    const InterestRateModel = await ethers.getContractFactory("InterestRateModel");
    const interestModel = await InterestRateModel.deploy(5, 1);
    await interestModel.waitForDeployment();

    const lending = await LendingPool.deploy(tokenAddress, await interestModel.getAddress());

    await lending.waitForDeployment();

    const lendingAddress = await lending.getAddress();

    console.log("📍 LendingPool deployed:", lendingAddress);



    // ==============================
    // Check User Balance
    // ==============================

    const userBalance = await token.balanceOf(user.address);

    console.log(
        "💰 User Balance:",
        userBalance.toString()
    );



    const amount = ethers.parseUnits("100", 18);

    const borrowAmount = ethers.parseUnits("40", 18);



    // ==============================
    // Approve Token
    // ==============================

    const approveTx = await token
        .connect(user)
        .approve(
            lendingAddress,
            amount
        );

    await approveTx.wait();


    console.log("✅ Approved tokens");



    const allowance = await token.allowance(
        user.address,
        lendingAddress
    );


    console.log(
        "🔐 Allowance:",
        allowance.toString()
    );



    // ==============================
    // Deposit Collateral
    // ==============================


    const depositTx = await lending
        .connect(user)
        .depositCollateral(amount);


    await depositTx.wait();


    console.log(
        "💰 Collateral deposited"
    );



    // ==============================
    // Borrow
    // ==============================


    const borrowTx = await lending
        .connect(user)
        .borrow(borrowAmount);


    await borrowTx.wait();


    console.log(
        "🏦 Borrowed:",
        borrowAmount.toString()
    );



    // ==============================
    // Check Position
    // ==============================


    const position = await lending.getPosition(
        user.address
    );


    console.log("📊 Position:");

    console.log(
        "Collateral:",
        position[0].toString()
    );


    console.log(
        "Debt:",
        position[1].toString()
    );



    // ==============================
    // Repay Loan
    // ==============================


    const repayAmount = await lending.getTotalDebt(user.address);

    // repay() pulls `debt + interest` based on *current* timestamp inside the contract.
    // Approve a slightly higher amount to cover interest accrual between calculation and tx mining.
    const repayApproveBuffer = (repayAmount * 100n) / 99n; // ~+1.01%

    const repayApprove = await token
        .connect(user)
        .approve(
            lendingAddress,
            repayApproveBuffer
        );

    await repayApprove.wait();

    const repayTx = await lending
        .connect(user)
        .repay(repayApproveBuffer);



    await repayTx.wait();



    console.log(
        "🔄 Loan Repaid Successfully"
    );



    // ==============================
    // Final Position
    // ==============================


    const finalPosition = await lending.getPosition(
        user.address
    );


    console.log("📊 Final Position:");

    console.log(
        "Collateral:",
        finalPosition[0].toString()
    );


    console.log(
        "Debt:",
        finalPosition[1].toString()
    );



    console.log(
        "🎉 LendingPool Test Completed!"
    );
}



main().catch((err) => {

    console.error(
        "❌ Error:",
        err
    );

    process.exit(1);

});