import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Counter...");

  // Connect to the selected network
  const { ethers } = await network.connect();

  // Get Contract Factory
  const Counter = await ethers.getContractFactory("Counter");

  // Deploy
  const counter = await Counter.deploy();

  await counter.waitForDeployment();

  console.log("✅ Counter deployed!");
  console.log("📍 Address:", await counter.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});