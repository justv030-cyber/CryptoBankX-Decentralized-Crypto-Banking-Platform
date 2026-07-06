import { network } from "hardhat";

async function main() {
  console.log(" Starting LendingPool Test...");

  //  connect to network (hoodi / local / sepolia)
  const { ethers } = await network.connect();

  const [user] = await ethers.getSigners();

  console.log(" User:", user.address);

  //  Deploy Token
  const BankToken = await ethers.getContractFactory("BankToken");
  const token = await BankToken.deploy();
  await token.waitForDeployment();

  console.log("Token deployed:", await token.getAddress());

  //  Deploy LendingPool
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lending = await LendingPool.deploy(await token.getAddress());
  await lending.waitForDeployment();

  console.log("LendingPool deployed:", await lending.getAddress());

  // Mint / assume user has tokens (for testing we use deployer balance)

  const amount = ethers.parseUnits("100", 18);
  const borrowAmount = ethers.parseUnits("40", 18);

  // approve tokens to lending contract
  await token.connect(user).approve(await lending.getAddress(), amount);

  console.log("Approved tokens");

  //  deposit collateral
  await lending.connect(user).depositCollateral(amount);

  console.log("Collateral deposited");

  //  borrow tokens
  await lending.connect(user).borrow(borrowAmount);

  console.log("Borrowed:", borrowAmount.toString());

  //  check position
  const position = await lending.getPosition(user.address);

  console.log("Position:");
  console.log("Collateral:", position[0].toString());
  console.log("Debt:", position[1].toString());

  //  approve for repay
  await token.connect(user).approve(await lending.getAddress(), borrowAmount);

  //  repay loan
  await lending.connect(user).repay(borrowAmount);

  console.log("Loan Repaid Successfully");

  //  final check
  const finalPosition = await lending.getPosition(user.address);

  console.log("Final Position:");
  console.log("Collateral:", finalPosition[0].toString());
  console.log("Debt:", finalPosition[1].toString());

  console.log("LendingPool Test Completed!");
}

main().catch((err) => {
  console.error("Some Error:", err);
  process.exit(1);
});