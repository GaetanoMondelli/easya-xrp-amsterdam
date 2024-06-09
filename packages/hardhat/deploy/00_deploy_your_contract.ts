import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexAggregator, MockUniswapV3Factory, MockUniswapV3Pool, TaggingVerifier } from "../typechain-types";
// import { networks } from "../scripts/networks";
// import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Wallet } from "@ethersproject/wallet";
import * as markets from "../../../coingecko/market.json";
// import * as category from "../../../coingecko/category.json";
import fs from "fs";
import path, { parse } from "path";
import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "ethers";
const feeTier = 500;

const categoryObject = new Map<string, any[]>();

const tokenDetails = new Map<string, any>();
const xrpledgerChainId = 1440002;

const assets = [
  {
    id: "uniswap",
    symbol: "uni",
    name: "Uniswap",
    image: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg?1696512319",
    current_price: 7.57,
    chainId: xrpledgerChainId,
    market_cap: 5708336124,
    market_cap_rank: 24,
  },
  {
    id: "maker",
    symbol: "mkr",
    name: "Maker",
    image: "https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1696502423",
    current_price: 2822.2,
    chainId: xrpledgerChainId,
    market_cap: 2623387220,
    market_cap_rank: 50,
  },
  {
    id: "aave",
    symbol: "aave",
    name: "Aave",
    image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png?1696512452",
    current_price: 88.76,
    chainId: xrpledgerChainId,
    market_cap: 1318264689,
    market_cap_rank: 76,
  },
  {
    id: "havven",
    symbol: "snx",
    name: "Synthetix Network",
    image: "https://assets.coingecko.com/coins/images/3406/large/SNX.png?1696504103",
    current_price: 2.69,
    chainId: xrpledgerChainId,
    market_cap: 881888714,
    market_cap_rank: 105,
  },
  {
    id: "compound-governance-token",
    symbol: "comp",
    name: "Compound",
    image: "https://assets.coingecko.com/coins/images/10775/large/COMP.png?1696510737",
    current_price: 56.01,
    chainId: xrpledgerChainId,
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

// const tokenInfo = [
//   {
//     _symbol: "icp",
//     _address: "0x261077B4735a9f51Fa4D039622e44034685f8D15",
//     _chainId: "11155111",
//     _aggregator: "0x39d023905bDe8a03a2DE1277d32Ecd9873669756",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "uni",
//     _address: "0xE86Aaa5C82E1E27216E5C99965CDFDD7146e427c",
//     _chainId: "11155111",
//     _aggregator: "0x1A25d64647ed559E805b1A3671ff6a7007DeDfe8",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "mkr",
//     _address: "0x4F5599a8Ac5277844b08AC10f285F5fD835Ea26e",
//     _chainId: "11155111",
//     _aggregator: "0xddEFeB3cb5a1aa63DDfDa11Ac1C19bFDA84852D8",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "aave",
//     _address: "0x279d81B84a6Ea9a681D2D0C05069D9bCC7b1Dea2",
//     _chainId: "11155111",
//     _aggregator: "0x29BF60e7F7297eB933b669874E6f3D58fB3410bF",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "xec",
//     _address: "0x3F199C3C5bCa39a6dcFCcD58ef4444f005340E8c",
//     _chainId: "11155111",
//     _aggregator: "0xb76129dEa978931f2b6Eb5d19Cf0ffa8637E221B",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "rbn",
//     _address: "0xD0a2eAC2c85F5268862be40DC2C5A291E2642203",
//     _chainId: "11155111",
//     _aggregator: "0xFa49d3bf6Db9ac1aFB8836eEc64Da0e111d0c8e6",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "snx",
//     _address: "0x96FE8a937b7775dF3d5935689a2752020F3E39eE",
//     _chainId: "11155111",
//     _aggregator: "0x96Eb955a0ca6453b33673Ab7a416Bc931696Ae57",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "cake",
//     _address: "0x6f183E74FB60bB77329d9F896b1f705F9F17Cc68",
//     _chainId: "11155111",
//     _aggregator: "0x2238c422917636e71F0b79643556865Ed05F5B4B",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "crv",
//     _address: "0x52D90Fb98e99142F2f8f40Cf1C38755Cd779Bb55",
//     _chainId: "11155111",
//     _aggregator: "0x644Bc06b7e4b3422a8f4E8108F50Aa8dB2a3d3F6",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "ens",
//     _address: "0x45f9c02617dF6D1c75d5a9259D7BE941B3Cbe6bb",
//     _chainId: "11155111",
//     _aggregator: "0x75EC4640149086099f64b0bdec3906FE0A3e722c",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "zrx",
//     _address: "0xA2fbE4BC90Bcef9Eb38FbD7EDD8A4cFd0C1CE6c1",
//     _chainId: "11155111",
//     _aggregator: "0xa7191Dc6a118bbcA51E50Ee02E836E7Fb801d607",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "amp",
//     _address: "0x01b9f082F3f67fA334F7EB0bA236C7ce05086EFB",
//     _chainId: "11155111",
//     _aggregator: "0x3d3464FFfe0CB565E5776C9931C1099D9E54C921",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "comp",
//     _address: "0x1745A6e812CD39FFa7542214B2D3a4D864F83eaB",
//     _chainId: "11155111",
//     _aggregator: "0x7716D49E0d1d1AFbF593C04edCB8541E96D439b9",
//     _tags: ["governance"],
//   },
//   {
//     _symbol: "yfi",
//     _address: "0x2e8B93D6cB791C28777E86Ec4c7e663DDF1B7225",
//     _chainId: "11155111",
//     _aggregator: "0x0CC0Fc50BA7E459C061eF7Af9826e8Dbbb17d3Ce",
//     _tags: ["governance"],
//   },
// ];

const tokenInfo: any = [];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const sleepTime = 12000;
// import { config } from "@chainlink/env-enc";
/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  if (hre.network.name === "xrpledger") {
    const sepoliaChainId = 11155111;
    console.log("RPC URL:");
    await deploy("MockUSDC", {
      from: deployer,
      args: [],
      log: true,
    });
    await deploy("MockUniswapV3Factory", {
      from: deployer,
      log: true,
    });
    const mockUSDC = await hre.ethers.getContract("MockUSDC");
    const mockUniswapV3Factory = (await hre.ethers.getContract("MockUniswapV3Factory")) as MockUniswapV3Factory;

    await deploy("LiquidityManager", {
      from: deployer,
      args: [await mockUniswapV3Factory.getAddress(), [await mockUSDC.getAddress()]],
      log: true,
    });
    const liquidityManager = await hre.ethers.getContract("LiquidityManager");

    const marketArray = Object.values(markets);
    // id == governance
    let categoryArray = Object.values(assets);

    categoryArray = [categoryArray.find(c => c.id === "governance") as any];

    console.log("category", categoryArray);

    for (let i = 0; i < categoryArray.length; i++) {
      const category = categoryArray[i];
      const categoryID = category?.id;

      // load the file at `../../../../coingecko/categories/${categoryID}.json`
      // and parse it]

      if (categoryID !== undefined) {
        categoryObject.set(categoryID, []);
      }

      try {
        const categoryData = await fs.readFileSync(
          path.resolve(__dirname, `../../../../coingecko/categories/${categoryID}.json`),
          "utf8",
        );

        const categoryDataJSON = JSON.parse(categoryData);
        const length = 20; //categoryDataJSON.length;

        for (let j = 0; j < length; j++) {
          const market = categoryDataJSON[j];
          const symbol = market?.symbol;
          if (tokenInfo.find((token: any) => token._symbol === symbol) !== undefined) {
            console.log("Token already deployed", symbol);
            continue;
          }
          const priceObject = marketArray.find(m => m.symbol === symbol);
          console.log("Deploying Token", symbol, priceObject);
          if (priceObject !== undefined) {
            categoryObject.get(categoryID)?.push(symbol);
            if (tokenDetails.get(symbol) === undefined) {
              const decimals = 10;
              console.log("calculating circulating supply for", symbol, priceObject.circulating_supply);
              const circulatingSupply = BigNumber.from(String(priceObject.circulating_supply).replace(".", "")).mul(
                BigNumber.from("10").pow(
                  decimals - (String(priceObject.circulating_supply).split(".")[1]?.length || 0),
                ),
              );
              console.log("PRICEEE", circulatingSupply);

              tokenDetails.set(symbol, priceObject);
              console.log(symbol, priceObject.current_price, priceObject.circulating_supply, priceObject.name);

              await deploy("SimpleERC20", {
                from: deployer,
                args: [priceObject.name, priceObject.symbol, circulatingSupply],
                log: true,
              });
              await sleep(sleepTime);

              const currentPrice = BigNumber.from(String(priceObject.current_price).replace(".", "")).mul(
                BigNumber.from("10").pow(decimals - (String(priceObject.current_price).split(".")[1]?.length || 0)),
              );

              await deploy("MockAggregator", {
                from: deployer,
                args: [currentPrice, decimals],
                log: true,
              });
              await sleep(sleepTime);

              const simpleERC20 = await hre.ethers.getContract("SimpleERC20");
              const mockAggregator = await hre.ethers.getContract("MockAggregator");

              const minLiquidity = priceObject.total_volume * 0.05;
              const maxLiquidity = priceObject.total_volume * 0.3;
              const liquidity = Math.floor(Math.random() * (maxLiquidity - minLiquidity + 1) + minLiquidity);

              await deploy("MockUniswapV3Pool", {
                from: deployer,
                args: [
                  await simpleERC20.getAddress(),
                  await mockUSDC.getAddress(),
                  feeTier,
                  BigNumber.from(liquidity).toString(),
                ],
                log: true,
              });
              await sleep(sleepTime);

              const pool = await hre.ethers.getContract("MockUniswapV3Pool");

              console.log("Sleeping Finished");

              await mockUniswapV3Factory.setPool(
                await simpleERC20.getAddress(),
                await mockUSDC.getAddress(),
                feeTier,
                await pool.getAddress(),
              );
              console.log("Pool Set");
              await sleep(sleepTime);

              tokenInfo.push({
                _symbol: priceObject.symbol,
                _address: await simpleERC20.getAddress(),
                _chainId: sepoliaChainId.toString(),
                _aggregator: await mockAggregator.getAddress(),
                _tags: [categoryID],
              });
            } else {
              tokenInfo.find(token => token._symbol === symbol)?._tags.push(categoryID);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    // print on a file all the arguments of the index aggregator called args.json
    const sepoliaToChaidoRouter = "0x3E842E3A79A00AFdd03B52390B1caC6306Ea257E";
    const providerHash = ["0x9db032812994aabd3f3d25635ab22336a699bf3cf9b9ef84e547bbd8f7d0ae25"];

    await deploy("TaggingVerifier", {
      from: deployer,
      args: [providerHash],
      log: true,
    });
    await sleep(sleepTime);

    const taggingVerifier = (await hre.ethers.getContract("TaggingVerifier")) as TaggingVerifier;

    console.log("Deploying Index Aggregator", tokenInfo);
    console.log("Index Aggregator");

    await deploy("IndexAggregator", {
      from: deployer,
      args: [
        tokenInfo,
        await liquidityManager.getAddress(),
        sepoliaToChaidoRouter,
        {
          _timeWindow: 60,
          _sampleSize: 30,
          _bribeUnit: parseEther("0.05"),
        },
      ],
      log: true,
    });
    await sleep(sleepTime);

    console.log("Index Aggregator Deployed");

    const indexAggregator = (await hre.ethers.getContract("IndexAggregator")) as IndexAggregator;
    await indexAggregator.setTaggingVerifier(await taggingVerifier.getAddress());

    await indexAggregator.setChainLinkData(
      sepoliaToChaidoRouter,
      "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Link on sepolia
      sepoliaChainId,
      "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef", // 200 gwei key hash
    );

    for (let i = 0; i < categoryArray.length; i++) {
      console.log(categoryArray[i]?.id, categoryObject.get(categoryArray[i]?.id)?.length);
    }

    fs.writeFileSync(
      path.resolve(__dirname, "../args.json"),
      // remove later the categoryArray
      JSON.stringify([tokenInfo, 60, 5, await liquidityManager.getAddress(), categoryArray], null, 2),
    );

    // verify the contract on etherscan
    await hre.run("verify:verify", {
      address: await indexAggregator.getAddress(),
      constructorArguments: [tokenInfo, 60, 5, await liquidityManager.getAddress()],
    });
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["decentralised"];
