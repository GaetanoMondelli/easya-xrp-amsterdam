"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, Modal, Select, Steps } from "antd";
import type { NextPage } from "next";
import ReactJson from "react-json-view";
import { useAccount } from "wagmi";
import * as xrpl from "xrpl";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [client, setClient] = useState<any>(null);
  // const [oracle, setOracle] = useState<any>(null);
  const [stepCount, setStepCount] = useState(0);
  const [response, setResponse] = useState<any>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tokens, setTokens] = useState<any>([]);
  const [token, setToken] = useState<any>({});

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
        <button
          style={{
            height: "30px",
            padding: "3px 14px",
            backgroundColor: "#f56a00",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={async () => {
            setIsModalVisible(true);
          }}
        >
          Show Diagram
        </button>
        <br></br>

        <Select
          defaultValue="Token"
          style={{ width: 120 }}
          onChange={value => {
            console.log(value);
            setToken(tokens.find((t: any) => t.symbol === value));
          }}
        >
          {tokens.map((t: any) => (
            <Select.Option key={t.symbol} value={t.symbol}>
              <Avatar src={t.logo} size="small" />
              {t.symbol}
            </Select.Option>
          ))}
        </Select>
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
              marginTop: "20px",
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
                            setTokens(data);
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
                        fetch(`http://localhost:3000/api/account_lines?base_asset=${token.symbol}&price_unit=usd`)
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
                        fetch(
                          `http://localhost:3000/api/get_aggregated_price?base_asset=${token.symbol}&price_unit=USD`,
                        )
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
                        fetch(`http://localhost:3000/api/book_offers?base_asset=${token.symbol}`)
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
              {
                title: "Push XRPL Data to XRPL EVM SIDECHAIN",
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
                    Usign GMP (General Message Pass) Protocol from Axelar we push the on-chain data to the XRPL EVM
                    Sidechain. along with the ledger_index of the XRPL node to ensure the data is valid and can be
                    verified.
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
                            const paymentTx = {
                              TransactionType: "Payment",
                              Account: "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ",
                              Amount: "1",
                              Destination: "rfEf91bLxrTVC76vw1W3Ur8Jk4Lwujskmb",
                              SigningPubKey: "",
                              Flags: 0,
                              Fee: "30",
                              Memos: [
                                {
                                  Memo: {
                                    MemoData: "143669292488bd98a0F14F1c73829572f2c25773",
                                    MemoType: Buffer.from("destination_address").toString("hex").toUpperCase(),
                                  },
                                },
                                {
                                  Memo: {
                                    MemoData: Buffer.from("ethereum").toString("hex").toUpperCase(),
                                    MemoType: Buffer.from("destination_chain").toString("hex").toUpperCase(),
                                  },
                                },
                                {
                                  Memo: {
                                    MemoData: "df031b281246235d0e8c8254cd731ed95d2caf4db4da67f41a71567664a1fae8", // keccak256(abi.encode(gmpPayload)), in this example, keccak256(abi.encode(['string'], ['Just transferred XRP to Ethereum!']))
                                    MemoType: Buffer.from("payload_hash").toString("hex").toUpperCase(),
                                  },
                                },
                              ],
                            };

                            fetch("http://localhost:3000/api/payment", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(paymentTx),
                            })
                              .then(response => response.json())
                              .then(data => setResponse(data));
                            // setResponse({ "XRPL EVM Sidechain": "pushing Data on AXELAR" });
                            setStepCount(4);
                          });
                      }}
                    >
                      payment
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
            <br></br>
            <br></br>
            Response XRPL Mock Node :3000 Objects
            <br></br>
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
          src={"/index.png"}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderRadius: "5px",
            boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)",
          }}
          alt="XTF INDEXES FROM XRPL"
        />
        <br />
      </Modal>
    </>
  );
};

export default Home;
