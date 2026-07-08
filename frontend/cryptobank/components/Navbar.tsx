"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ethers } from "ethers";

export default function Navbar() {
  const [account, setAccount] = useState("");

  //--------------connect wallet function-----------------

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);

      toast.success("Wallet connected!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet.");
    }
  };

  // ------------------check wallet connection function-----------------

  const checkWallet = async () => {

    if (!window.ethereum) return;

    const provider =
      new ethers.BrowserProvider(window.ethereum);

    const accounts =
      await provider.send(
        "eth_accounts",
        []
      );

    if (accounts.length > 0) {
      setAccount(accounts[0]);
    }

  };


  // ------------------disconnect wallet function-----------------

  const disconnectWallet = () => {
    setAccount("");
    toast.success("Wallet disconnected.");
  };

  //------------------useEffect to check wallet connection-----------------

  useEffect(() => {
    checkWallet();

    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount("");
      } else {
        setAccount(accounts[0]);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  return (
    <nav className="flex items-center justify-between border-b border-gray-800 px-10 py-5">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">
          CryptoBankX
        </h1>

        <p className="text-sm text-gray-400">
          Decentralized Crypto Lending Platform
        </p>
      </div>

      {
        account ? (
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-white">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>

            <button
              onClick={disconnectWallet}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
          >
            Connect Wallet
          </button>
        )
      }
    </nav>
  );
}