// /app/api/get_liquidity/route.js
import { NextResponse } from "next/server";

const tokens = [
  {
    name: "Crypto Trading Fund",
    symbol: "CTF",
    logo: "https://s1.xrpl.to/token/40f7116137178f389491f9d8cfadf1db",
    circulation: 119405502.19,
  },
  {
    name: "Monerex",
    symbol: "MXI",
    logo: "https://s1.xrpl.to/token/46ea4d85b896c551060398a5d465e0d4",
    circulation: 99998943407.47,
  },
  {
    name: "Sologenic",
    symbol: "SOLO",
    logo: "https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607",
    circulation: 336754414.81,
  },
  {
    name: "GateHub Crypto BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/3b46a51a490abb329e865dd778167256",
    circulation: 411.96,
  },
  {
    name: "Bitstamp BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/ce7b81b078cf2c4f6391c39de3425e54",
    circulation: 329.9,
  },
  {
    name: "CasinoCoin",
    symbol: "CSC",
    logo: "https://s1.xrpl.to/token/70748f54ba5dad10714b39fb6fda4254",
    circulation: 64889847147.55,
  },
  {
    name: "Coreum",
    symbol: "CORE",
    logo: "https://s1.xrpl.to/token/b56a99b1c7d21a2bd621e3a2561f596b",
    circulation: 129287798.77,
  },
  {
    name: "GateHub Crypto USD",
    symbol: "USDKYC",
    logo: "https://s1.xrpl.to/token/a7cde93c44b168524a4de4de03750340",
    circulation: 4731750.45,
  },
  {
    name: "Gensler",
    symbol: "SEC",
    logo: "https://s1.xrpl.to/token/d82d3e90e993f588cdcfc94c4a4db66a",
    circulation: 403313296854397,
  },
  {
    name: "XRPayNet",
    symbol: "XRPayNet",
    logo: "https://s1.xrpl.to/token/db7bf4b4e43664fff9662a67a7df9285",
    circulation: 28746855904.67,
  },
  {
    name: "XRP Healthcare",
    symbol: "XRPH",
    logo: "https://s1.xrpl.to/token/8e6d0300aa44e7b371a5eaba0e8296e4",
    circulation: 72428477.83,
  },
  {
    name: "Ghost Coin",
    symbol: "GHOST",
    logo: "https://s1.xrpl.to/token/7aab234cfd95459b536e1a3f0e6a16c0",
    circulation: 168299400.0,
  },
  {
    name: "Ripple Fox",
    symbol: "CNY",
    logo: "https://s1.xrpl.to/token/0f036e757e4aca67a2d4ae7aab638a95",
    circulation: 18260311.64,
  },
  {
    name: "xGO",
    symbol: "XGO",
    logo: "https://s1.xrpl.to/token/278d39db36c3da3e1af705aca3b4712c",
    circulation: 92393948.38,
  },
];

const findToken = (base_asset) => {
  return tokens.find(token => token.symbol === base_asset);
};

const simulatedLiquidityResponse = (base_asset) => {
  const token = findToken(base_asset);
  if (!token) {
    return {
      status: "error",
      message: `Token not found: ${base_asset}`,
    };
  }

  const liquidity = token.circulation * 0.10;

  return {
    result: {
      offers: [
        {
          account: token.name,
          taker_gets: {
            currency: token.symbol,
            issuer: token.name,
            value: liquidity.toString()
          },
          taker_pays: {
            currency: "XRP",
            value: (liquidity / 1000).toString() // Simulated value
          }
        }
      ],
      status: "success"
    }
  };
};

// http://localhost:3000/api/get_liquidity?base_asset=CTF

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { base_asset } = req.query;
    if (!base_asset) {
      return res.status(400).json({ message: "base_asset is required" });
    }

    const response = simulatedLiquidityResponse(base_asset);
    return res.status(200).json(response);
  }

  res.status(405).json({ message: "Method Not Allowed" });
}