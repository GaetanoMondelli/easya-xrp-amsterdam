// /app/api/get_aggregate_price/route.js
import { NextResponse } from "next/server";

const tokens = [
  {
    name: "Crypto Trading Fund",
    symbol: "CTF",
    logo: "https://s1.xrpl.to/token/40f7116137178f389491f9d8cfadf1db",
    price_dollar: 0.4326,
    price_xrp: 0.8695,
    market_cap: 51662827.9,
    circulation: 119405502.19,
  },
  {
    name: "Monerex",
    symbol: "MXI",
    logo: "https://s1.xrpl.to/token/46ea4d85b896c551060398a5d465e0d4",
    price_dollar: 0.0005124,
    price_xrp: 0.00103,
    market_cap: 51246822.53,
    circulation: 99998943407.47,
  },
  {
    name: "Sologenic",
    symbol: "SOLO",
    logo: "https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607",
    price_dollar: 0.1093,
    price_xrp: 0.2196,
    market_cap: 36809496.0,
    circulation: 336754414.81,
  },
  {
    name: "GateHub Crypto BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/3b46a51a490abb329e865dd778167256",
    price_dollar: 69587.02,
    price_xrp: 139860.13,
    market_cap: 28667147.59,
    circulation: 411.96,
  },
  {
    name: "Bitstamp BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/ce7b81b078cf2c4f6391c39de3425e54",
    price_dollar: 68627.2,
    price_xrp: 137931.03,
    market_cap: 22640220.58,
    circulation: 329.9,
  },
  {
    name: "CasinoCoin",
    symbol: "CSC",
    logo: "https://s1.xrpl.to/token/70748f54ba5dad10714b39fb6fda4254",
    price_dollar: 0.0003341,
    price_xrp: 0.0006716,
    market_cap: 21683307.32,
    circulation: 64889847147.55,
  },
  {
    name: "Coreum",
    symbol: "CORE",
    logo: "https://s1.xrpl.to/token/b56a99b1c7d21a2bd621e3a2561f596b",
    price_dollar: 0.09975,
    price_xrp: 0.2004,
    market_cap: 12897028.55,
    circulation: 129287798.77,
  },
  {
    name: "GateHub Crypto USD",
    symbol: "USDKYC",
    logo: "https://s1.xrpl.to/token/a7cde93c44b168524a4de4de03750340",
    price_dollar: 1.0,
    price_xrp: 2.02,
    market_cap: 4752969.39,
    circulation: 4731750.45,
  },
  {
    name: "Gensler",
    symbol: "SEC",
    logo: "https://s1.xrpl.to/token/d82d3e90e993f588cdcfc94c4a4db66a",
    price_dollar: 0.0001155,
    price_xrp: 0.0002323,
    market_cap: 4661508.85,
    circulation: 403313296854397.17,
  },
  {
    name: "XRPayNet",
    symbol: "XRPayNet",
    logo: "https://s1.xrpl.to/token/db7bf4b4e43664fff9662a67a7df9285",
    price_dollar: 0.0001475,
    price_xrp: 0.0002965,
    market_cap: 4241704.52,
    circulation: 28746855904.67,
  },
  {
    name: "XRP Healthcare",
    symbol: "XRPH",
    logo: "https://s1.xrpl.to/token/8e6d0300aa44e7b371a5eaba0e8296e4",
    price_dollar: 0.04924,
    price_xrp: 0.09898,
    market_cap: 3566919.52,
    circulation: 72428477.83,
  },
  {
    name: "Ghost Coin",
    symbol: "GHOST",
    logo: "https://s1.xrpl.to/token/7aab234cfd95459b536e1a3f0e6a16c0",
    price_dollar: 0.01917,
    price_xrp: 0.03852,
    market_cap: 3226362.84,
    circulation: 168299400.0,
  },
  {
    name: "Ripple Fox",
    symbol: "CNY",
    logo: "https://s1.xrpl.to/token/0f036e757e4aca67a2d4ae7aab638a95",
    price_dollar: 0.1364,
    price_xrp: 0.2741,
    market_cap: 2491189.28,
    circulation: 18260311.64,
  },
  {
    name: "xGO",
    symbol: "XGO",
    logo: "https://s1.xrpl.to/token/278d39db36c3da3e1af705aca3b4712c",
    price_dollar: 0.02233,
    price_xrp: 0.0449,
    market_cap: 2064068.82,
    circulation: 92393948.38,
  },
];

const findTokenPrice = (base_asset: any, price_unit: any) => {
  const token = tokens.find(token => token.symbol === base_asset);
  if (!token) {
    return null;
  }
  return price_unit === "USD" ? token.price_dollar : token.price_xrp;
};

const simulatedResponse = (base_asset, price_unit) => {
  const price = findTokenPrice(base_asset, price_unit);
  if (price === null) {
    return {
      status: "error",
      message: "Token not found",
    };
  }

  return {
    entire_set: {
      mean: price.toString(),
      size: 10,
      standard_deviation: "0.1290994448735806",
    },
    ledger_current_index: 25,
    median: price.toString(),
    status: "success",
    trimmed_set: {
      mean: price.toString(),
      size: 6,
      standard_deviation: "0.1290994448735806",
    },
    validated: false,
    time: 78937648,
  };
};

// http://localhost:3000/api/get_aggregated_price?base_asset=CTF&price_unit=USD

export default async function handler(req: any, res: any) {
  if (req.method == "GET") {
    if (req.query.base_asset && req.query.price_unit) {
      return res.status(200).json(simulatedResponse(req.query.base_asset, req.query.price_unit));
    }
    res.status(200).json(tokens);
  }
  if (req.method == "POST") {
    if (req.body.base_asset && req.body.price_unit) {
      return res.status(200).json(simulatedResponse(req.body.base_asset, req.body.price_unit));
    }
  }
}
