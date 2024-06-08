// /app/api/payment/route.js
import { NextResponse } from "next/server";
import { Client, Wallet, xrpToDrops } from "xrpl";

let storedMemo = [];

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { TransactionType, Account, Amount, Destination, SigningPubKey, Flags, Fee, Memos } = req.body;

    // Validate the request body
    if (TransactionType !== "Payment" || !Account || !Amount || !Destination || !Fee || !Memos) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Store the Memo
    storedMemo.push({ TransactionType, Account, Amount, Destination, SigningPubKey, Flags, Fee, Memos });

    // Return the simulated response
    // return res.status(200).json({
    //   result: {
    //     engine_result: "tesSUCCESS",
    //     engine_result_code: 0,
    //     engine_result_message: "The transaction was applied.",
    //     // tx_blob: "1200002280000000240000000161400000000000000A68400000000000001E732102AAE8C4B7F2C74C6B441B4DF6E256FAD7A4E8F47A5FAEAD4F66ED9E9B7B7A32B274473045022100EB54E5F5C9A07D56432B62CBCA4717FBCEB36612385C689660482A68BCB1178602200A4E8E37E78E8B2E0AFC2B1351AB7BA9B964FA805DF8A8C6FFBB53502F4F27EF8114B4B1A08A648B53A4E6087D0BBE86493FEC68FD52D2D018A1CD1A50024E1000068114B5F762798E46CE5998DDB266DC56F889AD3DF6D1010",
    //     tx_blob: "1200002280000000240000000161400000000000000A68400000000000001E732102AAE8C4B7F2...",
    //     tx_json: {
    //       Account,
    //       Amount,
    //       Destination,
    //       Fee,
    //       Flags,
    //       Memos,
    //       Sequence: 1,
    //       SigningPubKey,
    //       TransactionType,
    //       hash: "966F8836CB9DCA15616857C7EAC208E02EB9274221F0BBBEC4B8E03D699DD6E3",
    //     },
    //   },
    //   status: "success",
    // });
    try {
      // Connect to the XRP Ledger testnet
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      const account = "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ";

      const ledger = await client.getLedgerIndex();

      const accountInfo = await client.request({
        command: 'account_info',
        account: account,
      });
      const sequence = accountInfo.result.account_data.Sequence;

      const myseed = "sEdT8WPqpEAVpygKSrA6svMHYU8NbaG";
      const wallet = Wallet.fromSeed(myseed);
      const paymentTx = {
        TransactionType: TransactionType,
        Account: Account,
        Amount: xrpToDrops(Amount), // Convert amount to drops
        Destination: Destination,
        LastLedgerSequence: ledger + 4,
        Sequence: sequence,
        Fee: Fee,
        Flags: Flags,
        SigningPubKey: SigningPubKey,
        Memos: Memos,
      };

      const signedTx = wallet.sign(paymentTx);

      let submitResult = await client.submitAndWait(signedTx.tx_blob);

      console.log("Transaction result:", submitResult);

      // Disconnect from the client
      await client.disconnect();

      return res.status(200).json(submitResult);

      // Return the simulated response with the transaction hash
      // return res.status(200).json({
      //   result: {
      //     engine_result: "tesSUCCESS",
      //     engine_result_code: 0,
      //     engine_result_message: "The transaction was applied.",
      //     tx_blob: signedTx.tx_blob,
      //     tx_json: {
      //       Account,
      //       Amount,
      //       Destination,
      //       Fee,
      //       Flags,
      //       Memos,
      //       Sequence: 1,
      //       SigningPubKey,
      //       TransactionType,
      //       hash: submitResult.result.tx_json.hash,
      //     },
      //   },
      //   status: "success",
      // });
    } catch (error) {
      console.error("Error submitting transaction:", error);
      return res.status(500).json({ message: "Error submitting transaction", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
