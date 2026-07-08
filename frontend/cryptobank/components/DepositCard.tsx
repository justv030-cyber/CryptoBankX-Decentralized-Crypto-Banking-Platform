"use client";

import { useState } from "react";
import { ethers } from "ethers";

import {
  BANK_TOKEN_ADDRESS,
  LENDING_POOL_ADDRESS,
} from "@/lib/contract";

import {
  bankTokenABI,
  lendingPoolABI,
} from "@/lib/abi";
import toast from "react-hot-toast";

export default function DepositCard() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const depositCollateral = async () => {
    try {


      if (!window.ethereum) {
        toast.error("Please install MetaMask");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        toast.error("Enter valid amount");
        return;
      }

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      console.log("Wallet:", await signer.getAddress());
      console.log("Lending:", LENDING_POOL_ADDRESS);
      console.log("Token:", BANK_TOKEN_ADDRESS);

      const token = new ethers.Contract(
        BANK_TOKEN_ADDRESS,
        bankTokenABI,
        signer
      );


      const balance = await token.balanceOf(await signer.getAddress());

      console.log(
        "Balance:",
        ethers.formatUnits(balance, 18)
      );

      const allowance = await token.allowance(
        await signer.getAddress(),
        LENDING_POOL_ADDRESS
      );

      console.log(
        "Allowance Before:",
        ethers.formatUnits(allowance, 18)
      );

      const lending = new ethers.Contract(
        LENDING_POOL_ADDRESS,
        lendingPoolABI,
        signer
      );

      const value = ethers.parseUnits(amount, 18);
      console.log("Amount:", value.toString());


      // Approve
      const approveTx = await token.approve(
        LENDING_POOL_ADDRESS,
        value
      );



      await approveTx.wait();

      const allowanceAfter = await token.allowance(
        await signer.getAddress(),
        LENDING_POOL_ADDRESS
      );

      console.log(
        "Allowance After:",
        ethers.formatUnits(allowanceAfter, 18)
      );

      // Deposit
      const depositTx = await lending.depositCollateral(
        value
      );

      // console.log(depositTx);


      console.log("Tran Hash : ",depositTx.hash)


      await depositTx.wait();

      toast.success("✅ Collateral Deposited Successfully");


      setAmount("");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.reason ||
        err?.shortMessage ||
        err?.message ||
        "Transaction Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#111827] p-8">

      <h2 className="mb-5 text-2xl font-bold">
        Deposit Collateral
      </h2>

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg border border-gray-700 bg-[#1F2937] p-4 outline-none"
      />

      <button
        onClick={depositCollateral}
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-green-500 py-3 font-bold transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : "Deposit"}
      </button>

    </div>
  );
}