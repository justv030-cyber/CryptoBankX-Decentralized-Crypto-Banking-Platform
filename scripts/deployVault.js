import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Counter...");

  // Connect to the selected network
  const { ethers } = await network.connect();

  // Get Contract Factory
  const vaultToken = await ethers.getContractFactory("Vault");

  // Deploy
  const vaulttoken = await vaultToken.deploy();

  await vaulttoken.waitForDeployment();

  console.log("✅ Vault deployed!");
  console.log("📍 Address:", await vaulttoken.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});