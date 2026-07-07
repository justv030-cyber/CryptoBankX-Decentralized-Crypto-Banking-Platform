import { network } from "hardhat";

async function main() {

    console.log("🚀 Deploying PriceOracle...");

    // Connect Network
    const { ethers } = await network.connect();

    const [owner] = await ethers.getSigners();

    console.log("👤 Owner:", owner.address);

    // Get Contract Factory
    const PriceOracle = await ethers.getContractFactory(
        "PriceOracle"
    );

    // Initial Price = $2 (18 decimals)
    const initialPrice = ethers.parseUnits("2", 18);

    // Deploy Contract
    const oracle = await PriceOracle.deploy(
        initialPrice,
        owner.address
    );

    await oracle.waitForDeployment();

    console.log("✅ PriceOracle deployed!");
    console.log(
        "📍 Address:",
        await oracle.getAddress()
    );

    console.log(
        "💲 Initial Price:",
        (await oracle.getPrice()).toString()
    );
}

main().catch((err) => {

    console.error("❌ Error:", err);

    process.exit(1);

});