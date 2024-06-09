# Description

In our previous hackathon in London, we introduced XTF, a solution for creating decentralized ETFs. This enables users to lock tokens across various chains into buckets and fractionalize them into shares on the EVM Sidechain Ledger.

During these months, we received a lot of positive feedback. However, one recurring concern from the community was about the centralization risks in selecting the list of tokens in the index. Initially, we considered using a similar strategy to our competitors by partnering with trusted third parties. However, we recognized the need to develop a more robust and decentralized solution to mitigate collusion risks.

Taking this feedback to heart, in this hackathon, we worked on a prototype to enhance decentralization when determining indexes.

We decided to calculate market caps on our mainchain (XRP EVM SIDECHAIN) using on-chain data from both EVM and XRPL, aggregating on-chain prices, supplies, and liquidity.

Our mainchain tracks all asset metrics, and we securely communicate external on-chain data to our mainchain using Axelar’s General Message Passing (GMP) protocol.

For XRP assets, we fetch data about liquidity using the `book_offers command`, comparing our token to reference coins like XRP/USD, and supply data through the `account_lines` command for each XRP token asset. We collect prices from multiple oracle sources, as described in the XLS-47d, and port them to the EVM Sidechain through Axelar’s GMP protocol.

For EVM assets, we pull on-chain data about liquidity using the `liquidity` method of the `IUniswapV3Pool` standard interface and supply data using the `totalSupply` method of ERC20 tokens. We send this data to our EVM mainchain using GMP’s callContract and contractExecutor. For prices, we use the standard IAggregatorPriceV3 from Chainlink.

In both cases, we employ the Axelar Bridge to propagate prices, supplies, and liquidity to our mainchain, the EVM sidechain, ensuring consistent metrics with EVM tokens that are used to calculate market capitalization:


![fromula](./formula3.png)

The main smart contract on the mainchain is the IndexAggregator, which stores this information about assets and persists it in an index when a new XTF fund needs to be created.

The weighting can be uniform among selected assets or market cap-weighted, where assets with larger market caps have a higher percentage in the index.

By defining our indexes using on-chain data and aggregating secure oracle data rather than third-party inputs, we want to provide a more trustworthy solution.



![arch](./arch.png)


# Technical Description


The XTF protocol functions similarly to a TradFi ETF. 
A TradFi ETF compiles a list of assets (an index), assigns weights to them, allocates a proportional amount of each asset into a bucket based on these weights, and then fractionalizes the bucket into ETF shares, representing ownership of the bucket.

Similarly, the XTF protocol requires an array of TokenInfo in its contract constructor. This TokenInfo array contains crucial details such as:
- Token address
- Chain ID (as XTF operates as a multichain protocol)
- Quantity required
- Address of the associated price oracle contract

These details enable the XTF protocol to accurately manage and fractionalize the assets within its ecosystem.

**The challenge is to determine, in a fair and collusion-resistant way, who decides the list of tokens and their quantities.**

Competitors in the space, such as  [TokenSets](https://www.tokensets.com/#/explore) and [IndexCoop](https://indexcoop.com/), rely on different methods for defining token lists. TokenSets allows the issuer, known as the manager, to define the token lists, with users trusting the manager based on their track record. IndexCoop relies on trusted parties like Bankless and DeFi Pulse to curate the token lists. However, these methods expose users to collusion risks.

Our solution aims to recreate on-chain operations to determine a proper index. 
We collect the following metrics over a time interval  t , divided into smaller intervals  t_x :

See the method: (see `collectPriceFeeds()` method)
- Total Supply: Circulation of the tokens
- Average Price: Average price over the time interval  t_1 
- Liquidty: Metric on how availble a token is ona. chain

We ensure an index can only be calculated if a sufficient number of data points are collected, maintaining data reliability. 

Additionally, we have a bribe system in place to reward those who call the methods to pull the data within the required intervals, incentivizing timely and accurate data collection. 


## DATA COLLECTION

While the main contract that tracks all data, liquidity, and persists the index resides on the **XRP EVM SIDECHAIN**, different contracts and systems are in place to collect on-chain data for assets on other blockchains. Data collection varies depending on the blockchain technology of the assets.

For assets on EVM chains, data collection is done by interacting directly with contracts.

- Total Supply:  `IER20(tokenInfo[i]._address).totalSupply()` method
- Price(n): `(, int256 answer, , , )=AggregatorV3Interface(tokenInfo[i]._aggregator).latestRoundData`();
- Liquidity(n): using the `IUniswap(uniswapfactory).liquidy()`


Once we have enough samples we can call the `updateTokenParams()` to process the collected data and calculate the aggregated data used for the index metric calculation.

If the assets are on not the mainchain (not on **XRP EVM SIDECHAIN**) the aggregated on-chain data (e.g. supplies and liquidity) are sent to mainchain through a GMP call of Axelar Bridge.

```
        bytes memory payload = abi.encode(
            IndexUpdateMessage({
                supplyMessages: _supplyMessages,
                liquidityMessages: _liquidityMessages
            })
        );
        // execute(chainId, mainChainId, payload);
        IAxelarGateway(axelarGateway).callContract(
            chainSelectorIdToDestinationChain[chainId],
            toAsciiString(mainChainAddress),
            payload
        );

```

If the assets are on the mainchain, i.e. on the **XRP EVM SIDECHAIN**, we processed messages from other chains through Axelar Gateway and we store updated metrics in the main smart contract.

As per Axelar docs we implemented the `execute` method that can be executed only bt the Axelar Gaetway

```
    function _execute(
        string calldata sourceChain_,
        string calldata sourceAddress_,
        bytes calldata payload_
    ) internal override {
        (IndexUpdateMessage memory message) = abi.decode(payload_, (IndexUpdateMessage));
        for (uint256 i = 0; i < message.liquidityMessages.length; i++) {
            LiquidityMessage memory liquidityMessage = message.liquidityMessages[i];
            liquidityMessages.push(liquidityMessage);
        }
        for (uint256 i = 0; i < message.supplyMessages.length; i++) {
            SupplyMessage memory supplyMessage = message.supplyMessages[i];
            supplyMessages.push(supplyMessage);
        }
    }
```


For XRPL ledger types, data collection is performed as follows:

1. Token List: A list of meaningful tokens is downloaded from https://xrpl.to.
2. Node Interaction: We interact with a rippled/clio node of at least version v2.0.21 and issue commands to get the metrics.


Note that most of the public JSON-RPC available do not allow to send write commands or are not comaptibile with `v2.0.21` that supports [XLS-47d](https://github.com/XRPLF/XRPL-Standards/discussions/129). This unfortuantely does not allow to even create oracles, with the `createOracle` command.

**IMPORTANT NOTE:***: Due to these constraints, we have mocked these XRPL node endpoints to ensure the responses match those from an actual node. See packages/nextjs/pages/api for the mock endpoint implementations.

- Total Supply: For each token, we use the account_lines command on the issuer account to get the total supply (balance). The balance of the issuer should be negative.
- Mean Price: For each token, we use get_aggregated_price from XLS-47d, passing a list of trusted oracles. To maintain consistency with the EVM chain solution, we use USD as the price unit.
- Liquidity of Tokens: For each token, we use the book_offers command on the issuer account to get the orders of the token related to a reference token (e.g., XRP). We sum all the orders to determine the total liquidity of the token.
- Data Push: Finally, we push the data to the mainchain, i.e., the XRP EVM SIDECHAIN, using the Axelar Bridge. This is done by adding metadata using a payment command.

Please see docs here for XRPL integration https://opensource.ripple.com/docs/axelar/call-a-smart-contract-function/ and here for EVM integration https://docs.axelar.dev/

## INDEX CALCULATION

Finally if we have collected all the required data we can persist the index using `persistIndex`

This functions had challenges related to the gas consumption of certain operations, while sorting by market cap. 

Initial implementations included Solidity code to sort assets based on specific criteria. However, when simulating a real-world environment with potentially thousands of assets across multiple chains, it became prohibitively expensive to keep the index ordered every time prices were updated *O(nlogn)*. This approach was not feasible to execute all at once due to the high gas costs. 

I initially tried to apply as much filtering as possible by category, liquidity, and excluding certain chains, and explored various sorting algorithms based on the way we updated data.

However, in the end, **I decided not to order the assets on-chain**. Instead, the contract records the prices and the time of the last update. When we need to define the index, we pull the data off-chain, **sort it off-chain**, and then pass it to the index function that verifies in *O(n)* time that the provided order is correct. This approach significantly reduces gas costs and ensures the system remains feasible and efficient

===

Quicknode endpoint:
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