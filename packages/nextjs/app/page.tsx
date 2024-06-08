"use client";

import { useEffect, useState } from "react";
import Image from "next/image"; 
import Link from "next/link";
import { Modal, Steps } from "antd";
import type { NextPage } from "next";
import ReactJson from "react-json-view";
import { useAccount } from "wagmi";
import * as xrpl from "xrpl";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [client, setClient] = useState<any>(null);
  // const [oracle, setOracle] = useState<any>(null);
  const [stepCount, setStepCount] = useState(0);
  const [response, setResponse] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);

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

        const response2 = await client.request({
          command: "account_info",
          account: "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ",
          ledger_index: "validated",
        });

        setClient(client);
        setBalance(response2.result.account_data.Balance);
        console.log("Account balance:", response2.result.account_data.Balance);
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
        {/* <img src="https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607" className="h-20 w-20" alt="logo" /> */}
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
          Create Oracle
        </button>
        <br></br>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            // alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <Steps
            direction="vertical"
            style={{
              width: "600px",
              // border: "1px solid #ccc",
              // text justifies the text
              // center the text
              // margin: "auto",
              marginTop: "50px",
            }}
            current={stepCount}
            items={[
              {
                title: "Fetches Tokens and Issuers",
                description: (
                  <>
                    We fetched all the registered tokens with their information from the XRPL node*.
                    <br></br>
                    <br></br>
                    <button
                      style={{
                        height: "30px",
                        width: "100%",
                        padding: "3px 4px",
                        backgroundColor: "#f56a00",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        fetch("http://localhost:3000/api/tokens")
                          .then(response => response.json())
                          .then(data => {
                            console.log(data);
                            setResponse(data);
                          });
                      }}
                    >
                      Fetch Token Info XRPL
                    </button>
                  </>
                ),
              },
              {
                title: "Fetch Supplies of Tokens",
                description: (
                  <>
                    For every token, we get the supply using the account_lines command on the issuer account to get the
                    total supply of the token.
                    <br></br>
                    <button
                      style={{
                        height: "30px",
                        width: "100%",
                        padding: "3px 4px",
                        backgroundColor: "#f56a00",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        fetch("http://localhost:3000/api/account_lines?base_asset=CTF&price_unit=usd")
                          .then(response => response.json())
                          .then(data => {
                            console.log(data);
                            setResponse(data);
                            setStepCount(1);
                          });
                      }}
                    >
                      account_lines
                    </button>
                  </>
                ),
              },
              {
                title: "Fecth Prices of Tokens",
                description: (
                  <>
                    For every token, we get the supply using the get_aggregated_price command on the issuer account to
                    get the the price of the token in USD from the trusted oracle sets.
                    <br></br>
                    <button
                      style={{
                        height: "30px",
                        width: "100%",
                        padding: "3px 4px",
                        backgroundColor: "#f56a00",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        fetch("http://localhost:3000/api/get_aggregated_price?base_asset=CTF&price_unit=USD")
                          .then(response => response.json())
                          .then(data => {
                            console.log(data);
                            setResponse(data);
                            setStepCount(2);
                          });
                      }}
                    >
                      get_aggregated_price
                    </button>
                  </>
                ),
              },
              {
                title: "Fetch Liquidity of Tokens",
                // subTitle: (
                //   <a
                //     style={{
                //       color: "green",
                //       textDecoration: "underline",
                //     }}
                //     href="https://sepolia.etherscan.io/tx/0x88f9a23993945c84d4accb1f2601cdd237c82d0ee3ad290e0f78bea5b803ac96"
                //   >
                //     TXhash (0x88f)
                //   </a>
                // ),
                description: (
                  <>
                    For every token, we get the Liquidity using the book_offers command on the issuer account to get the
                    orders of the token related to a reference token (e.g. XRP). We sum all the orders to get the total
                    liquidity of the token.
                    <br></br>
                    <button
                      style={{
                        height: "30px",
                        width: "100%",
                        padding: "3px 4px",
                        // green
                        backgroundColor: "#f56a00",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        fetch("http://localhost:3000/api/book_offers?base_asset=CTF")
                          .then(response => response.json())
                          .then(data => {
                            console.log(data);
                            setResponse(data);
                            setStepCount(3);
                          });
                      }}
                    >
                      book_offers
                    </button>
                  </>
                ),
              },
            ]}
          />
          <br></br>
          <br></br>

          <div
            style={{
              margin: "auto",
            }}
          >
            Response XRPL Mock Node :3000 Objects
            <br></br>
            <ReactJson src={response} />
          </div>
        </div>
      </div>
      {/* Oracle Response {oracle} */}
      <Modal
        width={1500}
        // title="ChainLink Data Feeds"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Image
          width={1400}
          height={1200}
          src={"/images/index.png"}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderRadius: "5px",
            boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
          }}
          alt="Available on OpenSea"
        />
        <br />
      </Modal>
    </>
  );
};

export default Home;
