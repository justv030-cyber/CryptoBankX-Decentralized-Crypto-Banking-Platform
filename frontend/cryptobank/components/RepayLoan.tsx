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

export default function RepayLoan() {
    const [loading, setLoading] = useState(false);

    const repayLoan = async () => {
        try {
            if (!window.ethereum) {
                toast.error("Please install MetaMask");
                return;
            }

            setLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const user = await signer.getAddress();

            console.log("Wallet:", user);
            console.log("Lending:", LENDING_POOL_ADDRESS);
            console.log("Token:", BANK_TOKEN_ADDRESS);

            const token = new ethers.Contract(
                BANK_TOKEN_ADDRESS,
                bankTokenABI,
                signer
            );

            const lending = new ethers.Contract(
                LENDING_POOL_ADDRESS,
                lendingPoolABI,
                signer
            );

            // Total Debt (Principal + Interest)
            const totalDebt = await lending.getTotalDebt(user);

            console.log(
                "Total Debt:",
                ethers.formatUnits(totalDebt, 18)
            );

            if (totalDebt === 0n) {
                toast.error("No active loan found");
                return;
            }

            // Wallet Balance
            const balance = await token.balanceOf(user);

            console.log(
                "Wallet Balance:",
                ethers.formatUnits(balance, 18)
            );

            if (balance < totalDebt) {
                toast.error("Insufficient CBT Balance");
                return;
            }

            // Current Allowance
            const allowance = await token.allowance(
                user,
                LENDING_POOL_ADDRESS
            );

            console.log(
                "Allowance Before:",
                ethers.formatUnits(allowance, 18)
            );

            // Approve if required
            if (allowance < totalDebt) {
                const approveTx = await token.approve(
                    LENDING_POOL_ADDRESS,
                    totalDebt
                );

                console.log("Approve Hash:", approveTx.hash);

                await approveTx.wait();

                console.log("Approve Confirmed");
            }

            const allowanceAfter = await token.allowance(
                user,
                LENDING_POOL_ADDRESS
            );

            console.log(
                "Allowance After:",
                ethers.formatUnits(allowanceAfter, 18)
            );

            // Repay Loan
            // const repayTx = await lending.repay(totalDebt);

            try {
                await lending.repay.staticCall(totalDebt);
                console.log("✅ Static call passed");
            } catch (e) {
                console.error("❌ Static Call Failed:", e);
                throw e;
            }

            // Send Transaction
            const repayTx = await lending.repay(totalDebt);

            console.log("Repay Hash:", repayTx.hash);

            await repayTx.wait();

            console.log("Repay Hash:", repayTx.hash);

            console.log(
                "Debt:",
                ethers.formatEther(totalDebt)
            );

            console.log(
                "Allowance:",
                ethers.formatEther(allowance)
            );

            console.log(
                "Balance:",
                ethers.formatEther(balance)
            );

            await repayTx.wait();

            toast.success("✅ Loan Repaid Successfully");

        } catch (err: any) {
            console.error(err);

            toast.error(
                err?.reason ||
                err?.shortMessage ||
                err?.message ||
                "Repay Failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl bg-[#111827] p-8">
            <h2 className="mb-5 text-2xl font-bold">
                Repay Loan
            </h2>

            <p className="mb-5 text-sm text-gray-400">
                Repays your complete outstanding loan including interest.
            </p>

            <button
                onClick={repayLoan}
                disabled={loading}
                className="w-full rounded-lg bg-blue-500 py-3 font-bold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Processing..." : "Repay Loan"}
            </button>
        </div>
    );
}