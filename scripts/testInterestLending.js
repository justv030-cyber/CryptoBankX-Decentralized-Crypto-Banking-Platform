import { network } from "hardhat";


async function main() {

    console.log("🧪 Starting Interest Lending Test...");


    const { ethers } = await network.connect();


    const [user] = await ethers.getSigners();


    console.log(
        "👤 User:",
        user.address
    );



    // ==============================
    // Deploy BankToken
    // ==============================

    const BankToken =
        await ethers.getContractFactory(
            "BankToken"
        );


    const token =
        await BankToken.deploy();


    await token.waitForDeployment();


    const tokenAddress =
        await token.getAddress();


    console.log(
        "📍 Token:",
        tokenAddress
    );



    // ==============================
    // Deploy Interest Model
    // ==============================

    const InterestRateModel =
        await ethers.getContractFactory(
            "InterestRateModel"
        );


    /*
        baseRate = 5
        multiplier = 1
    */

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
    // Deploy LendingPool
    // ==============================

    const LendingPool =
        await ethers.getContractFactory(
            "LendingPool"
        );


    const lending =
        await LendingPool.deploy(
            tokenAddress,
            interestAddress
        );


    await lending.waitForDeployment();


    const lendingAddress =
        await lending.getAddress();


    console.log(
        "📍 LendingPool:",
        lendingAddress
    );



    // ==============================
    // Deposit Collateral
    // ==============================


    const collateral =
        ethers.parseUnits(
            "100",
            18
        );


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
        "💰 Collateral deposited"
    );



    // ==============================
    // Borrow
    // ==============================


    const borrowAmount =
        ethers.parseUnits(
            "40",
            18
        );


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
    // Move Blockchain Time
    // ==============================


    await ethers.provider.send(
        "evm_increaseTime",
        [
            60 * 60 * 24 * 30
        ]
    );


    await ethers.provider.send(
        "evm_mine"
    );


    console.log(
        "⏳ 30 days passed"
    );



    // ==============================
    // Check Interest
    // ==============================


    const interest =
        await lending.calculateInterest(
            user.address
        );


    console.log(
        "📈 Interest:",
        interest.toString()
    );



    const totalDebt =
        await lending.getTotalDebt(
            user.address
        );


    console.log(
        "💳 Total Debt:",
        totalDebt.toString()
    );


    console.log(
        "User Balance before repay:",
        (await token.balanceOf(user.address)).toString()
    );


    console.log(
        "Allowance before repay:",
        (
            await token.allowance(
                user.address,
                lendingAddress
            )
        ).toString()
    );

    // ==============================
    // Repay
    // ==============================


    const repayAmount = await lending.getTotalDebt(
        user.address
    );


    const approveRepayTx = await token
        .connect(user)
        .approve(
            lendingAddress,
            repayAmount
        );


    await approveRepayTx.wait();


    console.log(
        "✅ Repay approval done"
    );



    const allowanceAfterApprove =
        await token.allowance(
            user.address,
            lendingAddress
        );


    console.log(
        "🔐 Repay Allowance:",
        allowanceAfterApprove.toString()
    );



    const repayTx = await lending
        .connect(user)
        .repay(
            repayAmount
        );


    await repayTx.wait();


    console.log(
        "🔄 Loan Repaid Successfully"
    );

  



    const position =
        await lending.getPosition(
            user.address
        );


    console.log(
        "📊 Final Debt:",
        position[1].toString()
    );


    console.log(
        "🎉 Interest Lending Test Completed"
    );

}



main().catch((error) => {

    console.error(
        "❌ Error:",
        error
    );

    process.exit(1);

});