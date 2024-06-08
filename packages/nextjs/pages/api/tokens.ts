// /app/api/get_aggregate_price/route.js
import { NextResponse } from "next/server";

const tokens = [
  {
    name: "Crypto Trading Fund",
    symbol: "CTF",
    logo: "https://s1.xrpl.to/token/40f7116137178f389491f9d8cfadf1db",
    account_issuer: "rCryptoTradingFundAccount",
  },
  {
    name: "Monerex",
    symbol: "MXI",
    logo: "https://s1.xrpl.to/token/46ea4d85b896c551060398a5d465e0d4",
    account_issuer: "rMonerexAccount",
  },
  {
    name: "Sologenic",
    symbol: "SOLO",
    logo: "https://s1.xrpl.to/token/0413ca7cfc258dfaf698c02fe304e607",
    account_issuer: "rSologenicAccount",
  },
  {
    name: "GateHub Crypto BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/3b46a51a490abb329e865dd778167256",
    account_issuer: "rGateHubBTCAccount",
  },
  {
    name: "Bitstamp BTC",
    symbol: "BTCKYC",
    logo: "https://s1.xrpl.to/token/ce7b81b078cf2c4f6391c39de3425e54",
    account_issuer: "rBitstampBTCAccount",
  },
  {
    name: "CasinoCoin",
    symbol: "CSC",
    logo: "https://s1.xrpl.to/token/70748f54ba5dad10714b39fb6fda4254",
    account_issuer: "rCasinoCoinAccount",
  },
  {
    name: "Coreum",
    symbol: "CORE",
    logo: "https://s1.xrpl.to/token/b56a99b1c7d21a2bd621e3a2561f596b",
    account_issuer: "rCoreumAccount",
  },
  {
    name: "GateHub Crypto USD",
    symbol: "USDKYC",
    logo: "https://s1.xrpl.to/token/a7cde93c44b168524a4de4de03750340",
    account_issuer: "rGateHubUSDAccount",
  },
  {
    name: "Gensler",
    symbol: "SEC",
    logo: "https://s1.xrpl.to/token/d82d3e90e993f588cdcfc94c4a4db66a",
    account_issuer: "rGenslerAccount",
  },
  {
    name: "XRPayNet",
    symbol: "XRPayNet",
    logo: "https://s1.xrpl.to/token/db7bf4b4e43664fff9662a67a7df9285",
    account_issuer: "rXRPayNetAccount",
  },
  {
    name: "XRP Healthcare",
    symbol: "XRPH",
    logo: "https://s1.xrpl.to/token/8e6d0300aa44e7b371a5eaba0e8296e4",
    account_issuer: "rXRPHealthcareAccount",
  },
  {
    name: "Ghost Coin",
    symbol: "GHOST",
    logo: "https://s1.xrpl.to/token/7aab234cfd95459b536e1a3f0e6a16c0",
    account_issuer: "rGhostCoinAccount",
  },
  {
    name: "Ripple Fox",
    symbol: "CNY",
    logo: "https://s1.xrpl.to/token/0f036e757e4aca67a2d4ae7aab638a95",
    account_issuer: "rRippleFoxAccount",
  },
  {
    name: "xGO",
    symbol: "XGO",
    logo: "https://s1.xrpl.to/token/278d39db36c3da3e1af705aca3b4712c",
    account_issuer: "rxGOAccount",
  },
];

export default async function handler(req, res) {
  if (req.method == "GET") {
    return res.status(200).json(tokens);
  }
  res.status(405).json({ message: "Method Not Allowed" });
}