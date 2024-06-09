import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { IndexAggregator, MockUniswapV3Factory } from "../typechain-types";
// import { networks } from "../scripts/networks";
// import { SubscriptionManager, SecretsManager, Location } from "@chainlink/functions-toolkit";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Wallet } from "@ethersproject/wallet";
import * as markets from "../../../coingecko/market.json";
// import * as category from "../../../coingecko/category.json";
import fs from "fs";
import path from "path";
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

const tokenInfo = [
  {
    _symbol: "uni",
    _address: "0x2d09B2F2392F779F1DAe37Cff2A26454F2f5A205",
    _chainId: "11155111",
    _aggregator: "0x51A29d54F09200f064Dd8657498dcc9d5b3AFec7",
    _tags: ["governance"],
  },
  {
    _symbol: "mkr",
    _address: "0x5065510427b04E199c61dEeE91fD600520eA76Dd",
    _chainId: "11155111",
    _aggregator: "0xb973c1ff930f796Afe8fe25e50FFF59e986517Fa",
    _tags: ["governance"],
  },
  {
    _symbol: "aave",
    _address: "0x38D86878696D92a737471b5A0cF2D9170Cf97716",
    _chainId: "11155111",
    _aggregator: "0x8034216804c8aC6eEB305f8189FCfE78A9634552",
    _tags: ["governance"],
  },
  {
    _symbol: "snx",
    _address: "0xdf8F7169b3bab437DBcc66A85683Fb833125375E",
    _chainId: "11155111",
    _aggregator: "0xF46a790305B64f1f96767aD13E9131f571cf048a",
    _tags: ["governance"],
  },
  {
    _symbol: "comp",
    _address: "0x10A855E153BC5f64e1802Ca015aF00da7255235e",
    _chainId: "11155111",
    _aggregator: "0xCF98E09c3e42345571ecF5B4AF18110C9eafd465",
    _tags: ["governance"],
  },
  {
    _symbol: "solo",
    _address: "0xC4D4e40eDf442Be21FdEfeA42f92D20d5155d88D",
    _chainId: "11155111",
    _aggregator: "0xf70FEf57181b289D701B1888ca7063c9Ca851215",
    _tags: ["governance"],
  },
  {
    _symbol: "sec",
    _address: "0x923FD2B4B27132aBEbb21E0b8d58ddDD4F67aD41",
    _chainId: "11155111",
    _aggregator: "0x20444F322055E4fe86C60c33aA6D99C67191e515",
    _tags: ["governance"],
  },
  {
    _symbol: "xrpaynet",
    _address: "0xC4E917dE3f75fc1D4b00577D2ECeE3FBcf1949bF",
    _chainId: "11155111",
    _aggregator: "0x43354ffb6acAF534c79050aAD23Cd625d86163aA",
    _tags: ["governance"],
  },
  {
    _symbol: "xrph",
    _address: "0x96AaAd93F59d04f8f642Dc546afACe3A673C8F44",
    _chainId: "11155111",
    _aggregator: "0xd86AdfD802cd74203ED00892151cfe9c832ea29f",
    _tags: ["governance"],
  },
  {
    _symbol: "ghost",
    _address: "0xDfCDE448D6874395ff4Bc90cB309A009E4463BB0",
    _chainId: "11155111",
    _aggregator: "0x1e4Da9411e221AF1B5F03dFE4d3D8586fe4F9933",
    _tags: ["governance"],
  },
  {
    _symbol: "cny",
    _address: "0x05da0a50a0152E52939D216dc42aBfE2bbE45059",
    _chainId: "11155111",
    _aggregator: "0x71B422F08E6B2F46b0FA638f15bbdE4274a210D8",
    _tags: ["governance"],
  },
  {
    _symbol: "xgo",
    _address: "0x73317A2FcC924D50b41d912f211F6bAEa148f77C",
    _chainId: "11155111",
    _aggregator: "0x8ce1ECD345b87f69366CaCE92353247d290387db",
    _tags: ["governance"],
  },
  {
    _symbol: "ctf",
    _address: "0xD5dcA95f992D254108f939f6C8705c640C0cb9ee",
    _chainId: "11155111",
    _aggregator: "0x1d9cD381ddF89eBcD60a373049828461Ed696F88",
    _tags: ["governance"],
  },
  {
    _symbol: "mxi",
    _address: "0x7340846AB500a6d442268203dD2E001b178f4dFc",
    _chainId: "11155111",
    _aggregator: "0x3A7897dCCFC5F61895fA0F6e560644B356125056",
    _tags: ["governance"],
  },
  {
    _symbol: "btckyc",
    _address: "0x2DA41D7A9d6214233fB13f1b4cA0A6fce14Fce60",
    _chainId: "11155111",
    _aggregator: "0x0DC00CCF27C6c154B3b2E8b68563874901d0a444",
    _tags: ["governance"],
  },
  {
    _symbol: "csc",
    _address: "0x2b30BFCE0Dc201fC0Ca686843BceC1574403799a",
    _chainId: "11155111",
    _aggregator: "0x74e41a331873992c23207f5e6b1A65465Ef9AAfD",
    _tags: ["governance"],
  },
  {
    _symbol: "core",
    _address: "0x4B2b4443DDa99Cd3e03c53779549E9A0f213828b",
    _chainId: "11155111",
    _aggregator: "0x5e6114b0dA73BE13cee7DB0d97DFF8612e9Ce15a",
    _tags: ["governance"],
  },
  {
    _symbol: "usdkyc",
    _address: "0x52a57341ce681eEfa9Fa13F12C7d3422EcAfd5a7",
    _chainId: "11155111",
    _aggregator: "0x69FFd8C6158403b7a142155612B6Fd61bdB90bb7",
    _tags: ["governance"],
  },
];

// const tokenInfo: any = [];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const sleepTime = 4000;
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
    // let Data = Object.values(assets);

    // categoryArray = [categoryArray.find(c => c.id === "governance") as any];

    // console.log("category", categoryArray);

    for (let i = 0; i < 1; i++) {
      const categoryID = "governance";

      // load the file at `../../../../coingecko/categories/${categoryID}.json`
      // and parse it]

      if (categoryID !== undefined) {
        categoryObject.set(categoryID, []);
      }

      try {
        const categoryData = Object.values(assets);

        for (let j = 0; j < categoryData.length; j++) {
          const market = categoryData[j];
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
              console.log(tokenInfo);
            } else {
              tokenInfo.find((token: any) => token._symbol === symbol)?._tags.push(categoryID);
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

    // await deploy("TaggingVerifier", {
    //   from: deployer,
    //   args: [providerHash],
    //   log: true,
    // });
    // await sleep(sleepTime);

    // const taggingVerifier = (await hre.ethers.getContract("TaggingVerifier")) as TaggingVerifier;

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
    // await indexAggregator.setTaggingVerifier(await taggingVerifier.getAddress());

    // for (let i = 0; i < categoryArray.length; i++) {
    //   console.log(categoryArray[i]?.id, categoryObject.get(categoryArray[i]?.id)?.length);
    // }

    fs.writeFileSync(
      path.resolve(__dirname, "../args.json"),
      // remove later the categoryArray
      JSON.stringify([tokenInfo, 60, 5, await liquidityManager.getAddress(), tokenInfo], null, 2),
    );

    // verify the contract on etherscan
    // await hre.run("verify:verify", {
    //   address: await indexAggregator.getAddress(),
    //   constructorArguments: [tokenInfo, 60, 30, await liquidityManager.getAddress()],
    // });
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["decentralised"];
