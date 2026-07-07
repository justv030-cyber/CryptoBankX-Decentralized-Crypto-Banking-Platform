import { network } from "hardhat";

async function main() {

    console.log("🧪 Starting LendingPool Test...");

    const { ethers } = await network.connect();

    const [user] = await ethers.getSigners();

    console.log("👤 User:", user.address);


    // ==============================
    // Deploy BankToken
    // ==============================

    const BankToken =
        await ethers.getContractFactory("BankToken");

    const token =
        await BankToken.deploy();

    await token.waitForDeployment();

    const tokenAddress =
        await token.getAddress();


    console.log(
        "📍 Token deployed:",
        tokenAddress
    );


    // ==============================
    // Deploy InterestRateModel
    // ==============================

    const InterestRateModel =
        await ethers.getContractFactory(
            "InterestRateModel"
        );


    const interestModel =
        await InterestRateModel.deploy(
            5,
            1
        );


    await interestModel.waitForDeployment();


    const interestAddress =
        await interestModel.getAddress();


    console.log(
        "📍 Interest Model:",
        interestAddress
    );


    // ==============================
    // Deploy Price Oracle
    // ==============================

    const PriceOracle =
        await ethers.getContractFactory(
            "PriceOracle"
        );


    const oracle =
        await PriceOracle.deploy(
            ethers.parseUnits("2",18),
            user.address
        );


    await oracle.waitForDeployment();


    const oracleAddress =
        await oracle.getAddress();


    console.log(
        "📍 Oracle deployed:",
        oracleAddress
    );


    // ==============================
    // Deploy LendingPool
    // ==============================


    const LendingPool =
        await ethers.getContractFactory(
            "LendingPool"
        );


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
        "📍 LendingPool deployed:",
        lendingAddress
    );



    // ==============================
    // Check User Balance
    // ==============================


    const userBalance =
        await token.balanceOf(
            user.address
        );


    console.log(
        "💰 User Balance:",
        userBalance.toString()
    );



    const amount =
        ethers.parseUnits(
            "100",
            18
        );


    const borrowAmount =
        ethers.parseUnits(
            "40",
            18
        );



    // ==============================
    // Approve Token
    // ==============================


    await token
        .connect(user)
        .approve(
            lendingAddress,
            amount
        );


    console.log(
        "✅ Approved tokens"
    );



    // ==============================
    // Deposit Collateral
    // ==============================


    await lending
        .connect(user)
        .depositCollateral(
            amount
        );


    console.log(
        "💰 Collateral deposited"
    );



    // ==============================
    // Borrow
    // ==============================


    await lending
        .connect(user)
        .borrow(
            borrowAmount
        );


    console.log(
        "🏦 Borrowed:",
        borrowAmount.toString()
    );



    // ==============================
    // Check Position
    // ==============================


    let position =
        await lending.getPosition(
            user.address
        );


    console.log(
        "📊 Before Repay"
    );


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


    const repayAmount =
        await lending.getTotalDebt(
            user.address
        );


    const repayApproveBuffer =
        (repayAmount * 100n) / 99n;


    await token
        .connect(user)
        .approve(
            lendingAddress,
            repayApproveBuffer
        );



    await lending
        .connect(user)
        .repay(
            repayApproveBuffer
        );


    console.log(
        "🔄 Loan Repaid Successfully"
    );



    // ==============================
    // Withdraw Collateral
    // ==============================


    const withdrawAmount =
        ethers.parseUnits(
            "100",
            18
        );


    await lending
        .connect(user)
        .withdrawCollateral(
            withdrawAmount
        );


    console.log(
        "💸 Collateral Withdrawn"
    );



    // ==============================
    // Final Position
    // ==============================


    position =
        await lending.getPosition(
            user.address
        );


    console.log(
        "📊 Final Position"
    );


    console.log(
        "Collateral:",
        position[0].toString()
    );


    console.log(
        "Debt:",
        position[1].toString()
    );



    console.log(
        "🎉 LendingPool Test Completed!"
    );

}



main().catch((err)=>{

    console.error(
        "Error:",
        err
    );

    process.exit(1);

});