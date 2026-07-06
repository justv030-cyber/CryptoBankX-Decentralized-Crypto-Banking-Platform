import { network } from "hardhat";

async function main() {
    console.log("Deploying Interest...");

    const { ethers } = await network.connect();

    const interestModel = await ethers.getContractFactory("InterestRateModel");

    const interest =
        await interestModel.deploy(
            5,
            1
        );

    await interest.waitForDeployment();

    console.log(
        "✅ Interest Model deployed:"
    );


    console.log(
        await interest.getAddress()
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})