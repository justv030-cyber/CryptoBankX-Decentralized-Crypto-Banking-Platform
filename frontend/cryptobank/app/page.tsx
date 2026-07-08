"use client";

import Navbar from "@/components/Navbar";
import DepositCard from "@/components/DepositCard";
import BorrowCard from "@/components/BorrowCard";
import RepayLoan from "@/components/RepayLoan";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import {
  BANK_TOKEN_ADDRESS,
  LENDING_POOL_ADDRESS,
} from "@/lib/contract";

import {
  bankTokenABI,
  lendingPoolABI,
} from "@/lib/abi";

export default function Home() {
  const [collateral, setCollateral] = useState("0");
  const [totalDebt, setTotalDebt] = useState("0");

  async function loadPosition() {

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const user = await signer.getAddress();


    const lending = new ethers.Contract(
      LENDING_POOL_ADDRESS,
      lendingPoolABI,
      provider
    );


    const position = await lending.getPosition(user);


    setCollateral(
      ethers.formatUnits(position[0], 18)
    );

  }


  const loadDebt = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user = await signer.getAddress();


    const lending = new ethers.Contract(
      LENDING_POOL_ADDRESS,
      lendingPoolABI,
      provider
    );

    const debt = await lending.getTotalDebt(
      await signer.getAddress()
    );

    console.log(await lending.interestRateModel());
    console.log(await lending.priceOracle());
    console.log(await lending.token());
    console.log(
  "Borrow Time:",
  (await lending.borrowTime(user)).toString()
);

console.log(
  "Debt:",
  (await lending.debt(user)).toString()
);

console.log(
  "Interest:",
  (await lending.calculateInterest(user)).toString()
);
    console.log("Debt:", debt.toString());
    // console.log("Allowance:", allowance.toString());
    // console.log("Balance:", balance.toString());

    // console.log(
    //   "Contract Balance:",
    //   (
    //     await token.balanceOf(LENDING_POOL_ADDRESS)
    //   ).toString()
    // );

    const formatted = Number(
      ethers.formatUnits(debt, 18)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });

    setTotalDebt(formatted);
  };

  useEffect(() => {
    loadPosition();
    loadDebt();
  }, []);

  return (


    <main className="min-h-screen bg-[#0B1120] text-white">
      {/* Navbar */}
      <Navbar />

      <div className="mx-auto max-w-7xl p-10">

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-xl bg-[#111827] p-6 shadow-lg">
            <h3 className="text-gray-400">
              Collateral
            </h3>

            <p className="mt-3 text-3xl font-bold">
              {collateral} CBT
            </p>
          </div>

          <div className="rounded-xl bg-[#111827] p-6 shadow-lg">
            <h3 className="text-gray-400">Debt</h3>

            <p className="mt-3 text-3xl font-bold text-red-400">
              {totalDebt} CBT
            </p>
          </div>

          <div className="rounded-xl bg-[#111827] p-6 shadow-lg">
            <h3 className="text-gray-400">
              Health Factor
            </h3>

            <p className="mt-3 text-3xl font-bold text-green-400">
              SAFE
            </p>
          </div>

          <div className="rounded-xl bg-[#111827] p-6 shadow-lg">
            <h3 className="text-gray-400">
              Oracle Price
            </h3>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              $2.00
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">

          {/* Deposit */}
          <DepositCard />

          {/* Borrow */}

          <BorrowCard />

          {/* Repay */}

          <RepayLoan />

          {/* Withdraw */}

          <div className="rounded-xl bg-[#111827] p-8">

            <h2 className="mb-5 text-2xl font-bold">
              Withdraw Collateral
            </h2>

            <input
              type="number"
              placeholder="Amount"
              className="w-full rounded-lg border border-gray-700 bg-[#1F2937] p-4 outline-none"
            />

            <button className="mt-5 w-full rounded-lg bg-red-500 py-3 font-bold hover:bg-red-600">
              Withdraw
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}