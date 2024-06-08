"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as xrpl from "xrpl";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const connectToXRPL = async () => {
      try {
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        setConnectionStatus("Connecting...");
        await client.connect();
        setConnectionStatus("Connected");

        // Subscribe to an account
        // await client.request({
        //   command: "subscribe",
        //   accounts: ["rEMuMyGj2wMm3iJbeX1EvhVZjjzffrEG8y"],
        // });

        const response = await client.request({
          command: "account_info",
          account: "rEMuMyGj2wMm3iJbeX1EvhVZjjzffrEG8y",
          ledger_index: "validated",
        });

        setBalance(response.result.account_data.Balance);
        console.log("Account balance:", response.result.account_data.Balance);
      } catch (error) {
        console.error("Error connecting to XRPL:", error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    connectToXRPL();

    // Cleanup on component unmount
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div>
          <div>Connection Status: {connectionStatus}</div>
          {connectionStatus === "Connected" && <div>XRPL Client Connected - Balance {balance}</div>}
        </div>
      </div>
    </>
  );
};

export default Home;
