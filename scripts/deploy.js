import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Counter...");

  // Connect to the selected network
  const { ethers } = await network.connect();

  // Get Contract Factory
  const bankToken = await ethers.getContractFactory("BankToken");

  // Deploy
  const counter = await bankToken.deploy();

  await counter.waitForDeployment();

  console.log("✅ BankToken deployed!");
  console.log("📍 Address:", await counter.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});