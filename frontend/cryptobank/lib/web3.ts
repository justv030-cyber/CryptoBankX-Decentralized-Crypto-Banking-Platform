import { BrowserProvider, Contract } from "ethers";
import { lendingPoolABI, bankTokenABI } from "./abi";
// import {ethers} from "ethers";
import {
  LENDING_POOL_ADDRESS,
  BANK_TOKEN_ADDRESS,
} from "./contract";

export async function getContracts() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new BrowserProvider(window.ethereum);

  const signer = await provider.getSigner();

  const lending = new Contract(
    LENDING_POOL_ADDRESS,
    lendingPoolABI,
    signer
  );

  const token = new Contract(
    BANK_TOKEN_ADDRESS,
    bankTokenABI,
    signer
  );

  return {
    provider,
    signer,
    lending,
    token,
  };
}