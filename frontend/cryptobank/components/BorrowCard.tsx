"use client";

import { useState } from "react";
import { ethers } from "ethers";

import {
  LENDING_POOL_ADDRESS,
} from "@/lib/contract";

import {
  lendingPoolABI,
} from "@/lib/abi";
import toast from "react-hot-toast";

export default function BorrowCard() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const borrow = async () => {
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

      const lending = new ethers.Contract(
        LENDING_POOL_ADDRESS,
        lendingPoolABI,
        signer
      );

      const value = ethers.parseUnits(amount, 18);

      const tx = await lending.borrow(value);

      console.log("Borrow Tx:", tx.hash);

      await tx.wait();

      toast.success("Borrow Successful");

      setAmount("");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.reason ||
        err?.shortMessage ||
        err?.message ||
        "Borrow Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#111827] p-8">
      <h2 className="mb-5 text-2xl font-bold">
        Borrow
      </h2>

      <input
        type="number"
        placeholder="Borrow Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-lg border border-gray-700 bg-[#1F2937] p-4 outline-none"
      />

      <button
        onClick={borrow}
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-blue-500 py-3 font-bold hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Borrow"}
      </button>
    </div>
  );
}