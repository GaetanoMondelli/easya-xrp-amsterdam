# Description

In our previous hackathon, we introduced XTF, a solution for creating decentralized ETFs. This enables users to lock tokens across various chains in buckets and fractionalize them into shares in the EVM Sidechain Ledger.

During these months, we received a lot of positive feedback. However, one recurring concern from the community was about the centralization risks in selecting the list of tokens in the index.

Taking this feedback to heart, in this hackathon, we worked on a prototype to enhance decentralization when determining indexes. 
Our solution uses on-chain data from the XLS-47d price oracle to aggregate data from multiple sources and port them to the EVM Side Chain through Axelar’s General Message Passing (GMP) protocol. The XLS-47d get_aggregate_price function retrieves the mean, median, and average from multiple sources, mitigating collusion risks related to a single entity source.

For EVM assets we pull onchan data about liquidity using the `liquidity` method of IUniswapPool standard interface and supply data using the totalSupply method of ERC20 tokens.  

For XRP assets we fetch data about liquidity by using the `book_offers` command and comparing our token to reference coins like XRP/USD, and supply data through the account_lines command for each XRP token.

We employ the Axelar Bridge to propagate prices, supplies and liquidity of XRP tokens to the EVM sidechain, ensuring consistent metrics with EVM tokens that are used to calculate the market capitalization:

Market Cap = totalSupply * AVG(prize) for all Token T with liquidity(T)> liquidity_threshold) 

A smart contract in the EVM Sidechai, IndexAggreagtor stores this information about assets and persist it in an index when a new XTF fund needs to be created.

By defining our indexes using on-chain data and aggregating secure oracle data rather than third-party inputs, we aim to provide a more trustworthy solution.







https://clean-soft-shard.xrp-testnet.quiknode.pro/c4578c13478cf1d63bf30c80d75b2651ffa56a69/


curl -X POST https://clean-soft-shard.xrp-testnet.quiknode.pro/c4578c13478cf1d63bf30c80d75b2651ffa56a69/ -H "Content-Type: application/json" -d '{
  "method": "submit",
  "params": [
    {
      "tx_json": {
        "TransactionType": "CreateOracle",
        "Account": "rLXbPN2kiiQ4skm7nU7Qe7ADNR8mqKLAyZ",
        "Symbol": "XRP",
        "SymbolClass": "63757272656E6379",
        "PriceUnit": "USD",
        "Provider": "70726F7669646572"
      },
      "secret": "sEdT8WPqpEAVpygKSrA6svMHYU8NbaG"
    }
  ]
}'



curl -X POST https://s.devnet.rippletest.net:51234/ -H "Content-Type: application/json" -d '{   
  "method": "submit",
  "params": [
    {
      "tx_json": {
        "TransactionType": "CreateOracle",
        "Account": "rKqgCYs5FDZR7Rrw17TVMsHQnRrWHc8qDY",
        "Symbol": "XRP",
        "SymbolClass": "63757272656E6379",
        "PriceUnit": "USD",
        "Provider": "70726F7669646572"
      },
      "secret": "sEdVEGpSDtt9WWwEBkhXFK1aSHTVXSb"
    }
  ]
}'