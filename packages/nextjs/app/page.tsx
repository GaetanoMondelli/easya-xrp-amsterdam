"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import * as xrpl from "xrpl";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [client, setClient] = useState<any>(null);
  const [oracle, setOracle] = useState<any>(null);

  const myseed = "sEdT8WPqpEAVpygKSrA6svMHYU8NbaG";
  const sequence = 1347914;

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
        //   accounts: ["rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ"],
        // });

        const response = await client.request({
          command: "account_info",
          account: "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ",
          ledger_index: "validated",
        });

        setClient(client);
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
        <img src="https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607" className="h-20 w-20" alt="logo" />
        <button
          className="mt-4"
          onClick={async () => {
            if (!client) return;
            const response = await client.request({
              command: "CreateOracle",
              account: "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ",
              Symbol: "XRP",
              SymbolClass: "63757272656E6379",
              PriceUnit: "USD",
              Provider: "70726F7669646572",
              ledger_index: "validated",
            });

            console.log(response);
          }}
        >
          Create oracle
        </button>
      </div>
      Oracle Response {oracle}
    </>
  );
};

export default Home;
