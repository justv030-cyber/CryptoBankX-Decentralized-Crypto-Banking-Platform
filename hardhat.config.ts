import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import { defineConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [hardhatEthers],

  solidity: "0.8.28",

  networks: {
    hoodi: {
      type: "http",
      chainType: "l1",

      url: process.env.HOODI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
});