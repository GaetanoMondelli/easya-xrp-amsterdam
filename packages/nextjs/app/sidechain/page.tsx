"use client";

import { useEffect, useState } from "react";
import * as category from "../../../../coingecko/category.json";
import * as young from "../../../../coingecko/young.json";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { Avatar, InputNumber, List, Modal, Popover, Select, Steps, Tag, Watermark } from "antd";
import { ArcElement, CategoryScale, Chart, LineElement, LinearScale, LogarithmicScale, PointElement } from "chart.js";
import type { NextPage } from "next";
import { Line, Pie } from "react-chartjs-2";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(LogarithmicScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(ArcElement);

const { Group } = Avatar;
const youngList = Object.values(young);
const categoryList = Object.values(category);

const colors = [
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(255, 159, 64)",
  "rgb(255, 159, 64)",
  "rgb(255, 99, 132)",
  "rgb(54, 162, 235)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
];

const IndexPage: NextPage = ({ params }: { params: { indexName: string } }) => {
  const [chartData, setChartData] = useState<any>();
  const [indexLimit, setIndexLimit] = useState(10);
  const [indexData, setIndexData] = useState<any>([]);
  const [equalWeighted, setEqualWeighted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stepCount, setStepCount] = useState(2);

  const [etehreumTimeStamp, setEthereumTimeStamp] = useState<any>(new Date().toLocaleDateString());
  const [binanceTimeStamp, setBinanceTimeStamp] = useState<any>(new Date().toLocaleDateString());

  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    // last 30 days for labels
    const date = "June 01, 2024 16:16:36";
    const tokenInfo = [
      {
        id: "uniswap",
        symbol: "uni",
        name: "Uniswap",
        image: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg?1696512319",
        current_price: 7.57,
        market_cap: 5708336124,
        market_cap_rank: 24,
      },
      {
        id: "maker",
        symbol: "mkr",
        name: "Maker",
        image: "https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502423",
        current_price: 2822.23,
        market_cap: 2623387220,
        market_cap_rank: 50,
      },
      {
        id: "aave",
        symbol: "aave",
        name: "Aave",
        image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1696512452",
        current_price: 88.76,
        market_cap: 1318264689,
        market_cap_rank: 76,
      },
      {
        id: "havven",
        symbol: "snx",
        name: "Synthetix Network",
        image: "https://assets.coingecko.com/coins/images/3406/large/SNX.png?1696504103",
        current_price: 2.69,
        market_cap: 881888714,
        market_cap_rank: 105,
      },
      {
        id: "compound-governance-token",
        symbol: "comp",
        name: "Compound",
        image: "https://assets.coingecko.com/coins/images/10775/large/COMP.png?1696510737",
        current_price: 56.01,
        market_cap: 383777741,
        market_cap_rank: 201,
      },
      {
        id: "sologenic",
        symbol: "solo",
        name: "Sologenic",
        image: "https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607",
        current_price: 0.1093,
        market_cap: 48809496.0,
        market_cap_rank: 0,
      },
      {
        id: "gensler",
        symbol: "sec",
        name: "Gensler",
        image: "https://s1.xrpl.to/token/d82d3e90e993f588cdcfc94c4a4db66a",
        current_price: 0.0001155,
        market_cap: 4661508.85,
        market_cap_rank: 0,
      },
      {
        id: "xrpaynet",
        symbol: "xrpaynet",
        name: "XRPayNet",
        image: "https://s1.xrpl.to/token/db7bf4b4e43664fff9662a67a7df9285",
        current_price: 0.0001475,
        market_cap: 4241704.52,
        market_cap_rank: 0,
      },
      {
        id: "xrph",
        symbol: "xrph",
        name: "XRP Healthcare",
        image: "https://s1.xrpl.to/token/8e6d0300aa44e7b371a5eaba0e8296e4",
        current_price: 0.04924,
        market_cap: 3566919.52,
        market_cap_rank: 0,
      },
      {
        id: "ghost",
        symbol: "ghost",
        name: "Ghost Coin",
        image: "https://s1.xrpl.to/token/7aab234cfd95459b536e1a3f0e6a16c0",
        current_price: 0.01917,
        market_cap: 3226362.84,
        market_cap_rank: 0,
      },
      {
        id: "ripplefox",
        symbol: "cny",
        name: "Ripple Fox",
        image: "https://s1.xrpl.to/token/0f036e757e4aca67a2d4ae7aab638a95",
        current_price: 0.1364,
        market_cap: 2491189.28,
        market_cap_rank: 0,
      },
      {
        id: "xgo",
        symbol: "xgo",
        name: "xGO",
        image: "https://s1.xrpl.to/token/278d39db36c3da3e1af705aca3b4712c",
        current_price: 0.02233,
        market_cap: 2064068.82,
        market_cap_rank: 0,
      },
      {
        id: "cryptotradingfund",
        symbol: "ctf",
        name: "Crypto Trading Fund",
        image: "https://s1.xrpl.to/token/40f7116137178f389491f9d8cfadf1db",
        current_price: 0.4326,
        market_cap: 51662827.9,
        market_cap_rank: 0,
      },
      {
        id: "monerex",
        symbol: "mxi",
        name: "Monerex",
        image: "https://s1.xrpl.to/token/46ea4d85b896c551060398a5d465e0d4",
        current_price: 0.0005124,
        market_cap: 51246822.53,
        market_cap_rank: 0,
      },
      {
        id: "gatehubcryptobtc",
        symbol: "btckyc",
        name: "GateHub Crypto BTC",
        image: "https://s1.xrpl.to/token/3b46a51a490abb329e865dd778167256",
        current_price: 69587.02,
        market_cap: 28667147.59,
        market_cap_rank: 0,
      },
      {
        id: "bitstampbtc",
        symbol: "btckyc",
        name: "Bitstamp BTC",
        image: "https://s1.xrpl.to/token/ce7b81b078cf2c4f6391c39de3425e54",
        current_price: 68627.2,
        market_cap: 22640220.58,
        market_cap_rank: 0,
      },
      {
        id: "casinocoin",
        symbol: "csc",
        name: "CasinoCoin",
        image: "https://s1.xrpl.to/token/70748f54ba5dad10714b39fb6fda4254",
        current_price: 0.0003341,
        market_cap: 21683307.32,
        market_cap_rank: 0,
      },
      {
        id: "coreum",
        symbol: "core",
        name: "Coreum",
        image: "https://s1.xrpl.to/token/b56a99b1c7d21a2bd621e3a2561f596b",
        current_price: 0.09975,
        market_cap: 12897028.55,
        market_cap_rank: 0,
      },
      {
        id: "gatehubcryptousd",
        symbol: "usdkyc",
        name: "GateHub Crypto USD",
        image: "https://s1.xrpl.to/token/a7cde93c44b168524a4de4de03750340",
        current_price: 1.0,
        market_cap: 4752969.39,
        market_cap_rank: 0,
      },
    ];

    console.log(tokenInfo);
    setIndexData(tokenInfo);
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const today = new Date();
    const labels = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toLocaleDateString();
    });

    const data = indexData ? indexData.map((m: any) => m.current_price).slice(0, 30) : [];
    if (data.length < 30) {
      // push the same values from the start day by day
      let j = 0;
      for (let i = data.length; i < 30; i++) {
        data.push(data[j++]);
      }
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Meme Token Price",
          data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    });
  }, [indexData]);

  const isOnDiffChain = (symbol: string) => {
    const currentChain = targetNetwork.name === "Sepolia" ? "ETHEREUM" : targetNetwork.name;
    if (currentChain === "ETHEREUM") {
      return (
        youngList.find((y: any) => String(y.symbol).toLowerCase() === symbol.toLowerCase())?.networks?.[0].Name !==
        "ETHEREUM"
      );
    }
    return (
      youngList.find((y: any) => String(y.symbol).toLowerCase() === symbol.toLowerCase())?.networks?.[0].Name ===
      "ETHEREUM"
    );
  };

  return (
    <Watermark
      zIndex={-9}
      style={
        // take the whole screen in the behind all the elements
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          minHeight: "100%",
        }
      }
      content={targetNetwork.name}
      height={230}
      width={250}
    >
      <div className="text-center mt-8 p-10">
        <br />
        <h1
          style={{
            fontSize: "3rem",
          }}
        >
          {"EVM & XRPL Index Fund"}
        </h1>
        <br />
        <h2
          style={{
            fontSize: "1.3rem",
            marginBottom: "1rem",
          }}
        >
          {"Axelar Bridge Connected "}
          <Popover
            content={
              <>
                <p>
                  Attestation provided by <a href="https://www.reclaimprotocol.org/">XTF</a>
                </p>
              </>
            }
            title={
              <>
                <p>
                  <span>Attestation Verfied</span> <CheckCircleTwoTone twoToneColor="#52c41a" />
                </p>
              </>
            }
          >
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          </Popover>
        </h2>
        <br />
        <p
          style={{
            width: "1200px",
            // border: "1px solid #ccc",
            // text justifies the text
            // center the text
            margin: "auto",
          }}
        >
          {/* Meme coins are coins that are created as a joke or meme. They are often created to make fun of the
          cryptocurrency industry or to make a quick buck. Some meme coins have gained popularity and have become
          valuable, while others have faded into obscurity. */}
          {categoryList.find((c: any) => c.id === params.indexName)?.content}
        </p>
        <br />
        <Steps
          style={{
            width: "850px",
            height: "250px",
            // border: "1px solid #ccc",
            // text justifies the text
            // center the text
            margin: "auto",
          }}
          current={stepCount}
          items={[
            {
              title: "Update EVM Chain Data",
              description: (
                <>
                  Get supplies (totalSupply), prices (V3Aggregator), and liquidity (Uniswap) from the EVM tokens
                  <br></br>
                  <br></br>
                  <button
                    style={{
                      height: "30px",
                      width: "200px",
                      backgroundColor: "#f56a00",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      // put on bottom
                      position: "absolute",
                      bottom: "0",
                    }}
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >
                    Update Data
                  </button>
                </>
              ),
            },
            {
              title: "Updated Axeler Bridge",
              description: (
                <>
                  Axelar Bridge executes a cross-chain transaction pushing external chain data to the Index Aggregator
                  contract
                  <br></br>
                  {/* <button
                    style={{
                      height: "30px",
                      width: "200px",
                      backgroundColor: "#f56a00",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      position: "absolute",
                      bottom: "0",
                    }}
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >Approve</button> */}
                </>
              ),
              // subTitle: (
              //   <a
              //     style={{
              //       color: "green",
              //       textDecoration: "underline",
              //     }}
              //     href="https://sepolia.etherscan.io/tx/0xe3bc877a71b6e194b245de01af285b6768597906a3d0255b4b4a555cd79e4705"
              //   >
              //     TXhash (0xe3b)
              //   </a>
              // ),
            },
            {
              title: "Persist List of Tokens",
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
                  Persist the list of tokens to the Index Aggregator contract
                  <br></br>
                  <button
                    style={{
                      height: "30px",
                      width: "200px",
                      padding: "3px 4px",
                      // green
                      backgroundColor: "#f56a00",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      position: "absolute",
                      bottom: "0",
                    }}
                    onClick={() => {
                      console.log("clicked");
                    }}
                  >
                    Publish
                  </button>
                </>
              ),
            },
          ]}
        />
        <br />
        <br />
        {indexData && (
          <List
            // className="demo-loadmore-list"
            itemLayout="horizontal"
            bordered
            style={{
              marginTop: "80px",
              minHeight: "400px",
              width: "1000px",
              margin: "auto",
            }}
            dataSource={
              // meme is not an array, so we need to convert it to an array
              Object.keys(indexData)
                .map((k: any) => indexData[k])
                .slice(0, indexLimit)
            }
            renderItem={item => (
              <List.Item
                actions={[
                  // <a key="list-loadmore-edit">{"Rank #" + item.market_cap_rank}</a>,
                  <a key="list-loadmore-edit">{"$" + item.market_cap}</a>,
                  <a key="list-loadmore-more">{"Lqdty: " + Math.random().toFixed(2) + "P"}</a>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        width: "50px",
                        height: "50px",
                      }}
                      src={item.image}
                    />
                  }
                  title={
                    <>
                      {
                        <>
                          <Popover
                            // set the cursor to pointer

                            content={
                              isOnDiffChain(item.symbol) ? (
                                <p>
                                  Click to switch to{" "}
                                  {
                                    youngList.find(
                                      (y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase(),
                                    )?.networks?.[0].Name
                                  }
                                </p>
                              ) : (
                                ""
                              )
                            }
                          >
                            {item.name}
                            <Tag
                              style={{
                                cursor: "pointer",
                                marginLeft: "10px",
                                color: isOnDiffChain(item.symbol) ? "blue" : "green",
                              }}
                              onClick={() => {
                                console.log("clicked");
                              }}
                            >
                              {youngList.find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                                ?.networks?.[0].Name || "XRPL LEDGER"}
                            </Tag>
                          </Popover>
                        </>
                      }
                    </>
                  }
                  description={
                    <span>
                      {youngList.find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                        ?.descriptions?.en !== undefined
                        ? youngList
                            .find((y: any) => String(y.symbol).toLowerCase() === item.symbol.toLowerCase())
                            ?.descriptions?.en?.slice(0, 100) + "..."
                        : "No description available"}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
        {/* central button for launch an XTF Fund */}
        <br />
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "5px",
            // backgroundColor: "#1890ff",
            backgroundColor: "#f56a00",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={showModal}
        >
          Launch XTF Fund
        </button>
        <Modal
          width={1200}
          title={
            <h1
              style={{
                fontSize: "1.7rem",
              }}
            >
              Launch a new XTF Fund
            </h1>
          }
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          // hide cancel button
          footer={[
            <button
              key={1}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                // backgroundColor: "#1890ff",
                backgroundColor: "#f56a00",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleOk}
            >
              Create Fund
            </button>,
          ]}
        >
          <div
            style={{
              border: "1px solid #ccc",
              // center the text
              margin: "auto",
              width: "1000px",
              padding: "20px",
              marginTop: "30px",
            }}
          >
            <br />
            <div
              style={{
                width: "400px",
                margin: "auto",
              }}
            >
              <br />
              <div
                style={{
                  // width: "500px",
                  margin: "auto",
                  display: "flex",
                }}
              >
                <InputNumber
                  style={{
                    width: "150px",
                    marginRight: "20px",
                  }}
                  label="Index Limit"
                  min={3}
                  max={indexData.length}
                  value={indexLimit}
                  onChange={(value: any) => setIndexLimit(value as number)}
                />
                <InputNumber
                  style={{
                    width: "200px",
                    marginRight: "20px",
                  }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  min={100}
                  defaultValue={1000}
                  max={10000}
                />
                <Select
                  defaultValue="cap_weighted"
                  style={{
                    width: "150px",
                  }}
                  onChange={(value: any) => {
                    if (value === "equal_weighted") {
                      setEqualWeighted(true);
                    } else {
                      setEqualWeighted(false);
                    }
                  }}
                >
                  <Select.Option value="cap_weighted">Cap Weighted</Select.Option>
                  <Select.Option value="equal_weighted">Equal Weighted</Select.Option>
                </Select>
              </div>
              <br />
              <Pie
                data={{
                  labels: indexData.map((m: any) => m.market_cap).slice(0, indexLimit),
                  datasets: [
                    {
                      label: "My First Dataset",
                      borderWidth: 2,
                      data: equalWeighted
                        ? Array(indexLimit).fill(1)
                        : indexData.map((m: any) => m.market_cap).slice(0, indexLimit),
                      backgroundColor: colors,
                      // hoverOffset: 4,
                    },
                  ],
                }}
              ></Pie>
            </div>
            <br />
            {/* print a custom legen made by small square of the color and name of asset next to it */}
            <div
              style={{
                width: "960px",
                margin: "auto",
              }}
            >
              {indexData.slice(0, indexLimit).map((m: any, i: number) => (
                <Group key={i} style={{ display: "inline-block", margin: "10px" }}>
                  <Avatar
                    style={{
                      backgroundColor: colors[i],
                      width: "20px",
                      height: "20px",
                      marginRight: "10px",
                    }}
                  ></Avatar>
                  <span>{m.name}</span>
                </Group>
              ))}
            </div>
          </div>
          <br />
        </Modal>
      </div>
    </Watermark>
  );
};

export default IndexPage;
