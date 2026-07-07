import { expect } from "chai";
import { network } from "hardhat";
import {ethers} from "ethers";


describe("LendingPool Liquidation", function () {

    let owner;
    let user;
    let liquidator;
    let attacker;

    let token;
    let interest;
    let oracle;
    let lending;


    beforeEach(async function () {

        const { ethers } = await network.connect();


        [
            owner,
            user,
            liquidator,
            attacker
        ] = await ethers.getSigners();



        // Deploy Token
        const BankToken =
            await ethers.getContractFactory("BankToken");


        token = await BankToken.deploy();

        await token.waitForDeployment();



        // Deploy Interest Model

        const InterestRateModel =
            await ethers.getContractFactory(
                "InterestRateModel"
            );


        interest =
            await InterestRateModel.deploy(
                5,
                1
            );


        await interest.waitForDeployment();



        // Deploy Oracle

        const PriceOracle =
            await ethers.getContractFactory(
                "PriceOracle"
            );


        oracle =
            await PriceOracle.deploy(
                ethers.parseUnits("2",18),
                owner.address
            );


        await oracle.waitForDeployment();



        // Deploy LendingPool

        const LendingPool =
            await ethers.getContractFactory(
                "LendingPool"
            );


        lending =
            await LendingPool.deploy(
                await token.getAddress(),
                await interest.getAddress(),
                await oracle.getAddress()
            );


        await lending.waitForDeployment();


        // setup liquidation manager

        await lending
            .connect(owner)
            .setLiquidationManager(
                liquidator.address
            );

    });



    it("Should liquidate unhealthy position", async function () {


        const collateral =
            ethers.parseUnits("100",18);


        const borrowAmount =
            ethers.parseUnits("40",18);



        await token
            .transfer(
                user.address,
                collateral
            );


        await token
            .transfer(
                liquidator.address,
                ethers.parseUnits("1000",18)
            );



        await token
            .connect(user)
            .approve(
                await lending.getAddress(),
                collateral
            );


        await lending
            .connect(user)
            .depositCollateral(
                collateral
            );



        await lending
            .connect(user)
            .borrow(
                borrowAmount
            );



        // Price drop

        await oracle
            .connect(owner)
            .updatePrice(
                ethers.parseUnits("0.5",18)
            );



        expect(
            await lending.isSafe(user.address)
        ).to.equal(false);



        await token
            .connect(liquidator)
            .approve(
                await lending.getAddress(),
                ethers.parseUnits("1000",18)
            );



        await lending
            .connect(liquidator)
            .executeLiquidation(
                user.address,
                liquidator.address
            );



        const position =
            await lending.getPosition(
                user.address
            );


        expect(position[0])
            .to.equal(0n);


        expect(position[1])
            .to.equal(0n);


        console.log("🔥 Liquidation Passed");

    });



  it("Should reject liquidation from non-manager", async function () {

    let failed = false;

    try {

        await lending
            .connect(attacker)
            .executeLiquidation(
                user.address,
                attacker.address
            );

    } catch(error) {

        failed = true;

        expect(error.message)
            .to.include(
                "Only Liquidation Manager can call this function"
            );
    }


    expect(failed).to.equal(true);


    console.log(
        "🚫 Non manager rejected"
    );

});


});