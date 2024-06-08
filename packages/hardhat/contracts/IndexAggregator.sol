// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
// import {LiquidityManager} from "./LiquidityManager.sol"; // TO be implemented
// import {TaggingVerifier} from "./TaggingVerifier.sol"; TO be implemented

uint32 constant CALLBACK_GAS_LIMIT = 4_000_000;

struct ChainLinkData {
    address router;
    address link;
    uint64 currentChainSelectorId;
    bytes32 keyHash;
}

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
}

struct LiquidityMessage {
    address token;
    uint256 liquidity;
    uint32 chainId;
    uint256 timestamp;
} 
struct SupplyMessage {

    address token;
    uint256 supply;
    uint32 chainId;
    uint256 timestamp;
}

struct AggregatorParams {
    uint256 _timeWindow; 
    uint256 _sampleSize;
    // uint32 _chainId;
    uint256 _bribeUnit;
}

struct IndexUpdateMessage {
    SupplyMessage[] supplyMessages;
    LiquidityMessage[] liquidityMessages;
}

enum PayFeesIn {
    Native,
    LINK
}

error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);


contract IndexAggregator is CCIPReceiver {
    TokenInfo[] public tokenInfo;
    TokenInfo[] tmpTokens;
    LiquidityManager public liquidityManager;
    mapping(string => uint256) public tokens;
    string[] public tokenSymbols;

    
    SupplyMessage[] public supplyMessages;
    // LiquidityMessage[] public liquidityMessages;
    // TaggingVerifier public taggingVerifier;

    uint256[] public totalSupplies;
    uint256[] public liquidities;
    uint256[] public tokenParamsTimestampUpdates;

    mapping(uint256 => uint256[]) public movingAverage;
    uint256 sampleSize;
    uint256 timeWindow;
    uint256 samplingFrequency;
    uint256 lastSampleTime;
    uint256[] public lastIndexOrder;
    mapping(string => uint256[]) public tagsIndexOrder; 
    mapping(string => uint256) public tagsIndexTimestamp;
    uint256 public lastIndexTimestamp;
    uint256 public bribeUnit;
    uint32 public chainId;
    uint32 public mainChainId;

    ChainLinkData public chainLinkData;

    mapping(uint64 => address) public chainSelectorIdToSidechainAddress;


    constructor(TokenInfo[] memory _tokenInfo,  address _liquidityManager, address  router, AggregatorParams memory _aggregatorParams
    ) {
        sampleSize = _aggregatorParams._sampleSize;
        timeWindow = _aggregatorParams._timeWindow;
        samplingFrequency = timeWindow / sampleSize;
        bribeUnit = _aggregatorParams._bribeUnit;
        // liquidityManager = LiquidityManager(_liquidityManager);
        for (uint256 i = 0; i < _tokenInfo.length; i++) {
            tokenInfo.push(_tokenInfo[i]);
            tokenSymbols.push(_tokenInfo[i]._symbol);
            tokens[_tokenInfo[i]._symbol] = i;
            totalSupplies.push(IERC20(_tokenInfo[i]._address).totalSupply());
        }
    }

    // Initialize methods

    function setTaggingVerifier(address _taggingVerifier) external {
        taggingVerifier = TaggingVerifier(_taggingVerifier);
    }

    function setChainId(uint32 _chainId, uint32 _mainChainId) external {
        chainId = _chainId;
        mainChainId = _mainChainId;
    }

    function isMainChain() public view returns (bool) {
        return chainId == mainChainId;
    }

    function setSideChainAddress(
        uint64 chainSelectorId,
        address sideChainAddress
    ) external {
        chainSelectorIdToSidechainAddress[chainSelectorId] = sideChainAddress;
    }

    function updateTokenParams(uint256[] memory _totalSupplies, uint256[] memory _liquidities) external {

        for (uint256 i = 0; i < tokenInfo.length; i++) {
            if (tokenInfo[i]._chainId == chainId) {
                liquidities[i] = liquidityManager.getTotalLiquidityForToken(tokenInfo[i]._address);
                totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
                tokenParamsTimestampUpdates[i] = block.timestamp;
            }
        }

        if(isMainChain()){
            for (uint256 i = 0; i < totalSupplies.length; i++) {
                for (uint256 j = 0; j < tokenInfo.length; j++) {
                    if (tokenInfo[j]._address == supplyMessages[i].token) {
                        totalSupplies[j] = supplyMessages[i].supply;
                        tokenParamsTimestampUpdates[j] = liquidityMessages[i].timestamp;
                    }
                    continue;
                }
            }

            for (uint256 i = 0; i < liquidities.length; i++) {
                for (uint256 j = 0; j < tokenInfo.length; j++) {
                    if (tokenInfo[j]._address == liquidityMessages[i].token) {
                        liquidities[j] = liquidityMessages[i].liquidity;
                        tokenParamsTimestampUpdates[j] = liquidityMessages[i].timestamp;
                    }
                    continue;
                }
            }
        }
    }


    function checkTokenParams() public {
        for (uint256 i = 0; i < tokenInfo.length; i++) {
            if (block.timestamp - tokenParamsTimestampUpdates[i] >= timeWindow) {
                liquidities[i] = liquidityManager.getTotalLiquidityForToken(tokenInfo[i]._address);
                totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
                tokenParamsTimestampUpdates[i] = block.timestamp;
            }
        }
    }


    function collectPriceFeeds() external {
        require(block.timestamp - lastSampleTime >= samplingFrequency, "IndexAggregator: Sampling frequency not reached");

        if (block.timestamp - lastSampleTime >= timeWindow) {
            for (uint256 i = 0; i < tokenInfo.length; i++) {
                if (movingAverage[i].length > 0) {
                    movingAverage[i].pop();
                }
            }
        }

        for (uint256 i = 0; i < tokenInfo.length; i++) {
            (, int256 answer, , , ) = AggregatorV3Interface(tokenInfo[i]._aggregator).latestRoundData();

            movingAverage[i].push(uint256(answer));
            uint256 sum = 0;
            if (movingAverage[i].length > sampleSize) {
                movingAverage[i].pop();
            }
            for (uint256 j = 0; j < movingAverage[i].length; j++) {
                sum += movingAverage[i][j];
            }
        }
        lastSampleTime = block.timestamp;
        // if there is enough bribe pay it to the caller
        if (bribeUnit > 0) {
            payable(msg.sender).transfer(bribeUnit);
        }
    }
}