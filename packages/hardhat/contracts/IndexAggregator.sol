// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILiquidityManager} from "./ILiquidityManager.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import { AxelarExecutable } from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";


uint32 constant CALLBACK_GAS_LIMIT = 4_000_000;

struct TokenInfo {
    string _symbol;
    address _address;
    uint32 _chainId;
    address _aggregator;
    string[] _tags;
}

struct LiquidityMessage {
    address token;
    string tokenDemonination;
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
    LiquidityMessage[] liquidityMessages;
    SupplyMessage[] supplyMessages;
}

enum PayFeesIn {
    Native,
    LINK
}

error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);


contract IndexAggregator is AxelarExecutable {
	IAxelarGateway axelarGateway;
	TokenInfo[] public tokenInfo;
	TokenInfo[] tmpTokens;
	ILiquidityManager public liquidityManager;
	mapping(string => uint256) public tokens;
	string[] public tokenSymbols;

	SupplyMessage[] public supplyMessages;
	LiquidityMessage[] public liquidityMessages;
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
    address mainChainAddress;


	mapping(uint64 => address) public chainSelectorIdToSidechainAddress;
    mapping(uint64 => string) public chainSelectorIdToDestinationChain;

	constructor(
		TokenInfo[] memory _tokenInfo,
		address _liquidityManager,
		address _axelarGateway,
		AggregatorParams memory _aggregatorParams
	) 
    AxelarExecutable(_axelarGateway)
    {
		sampleSize = _aggregatorParams._sampleSize;
		timeWindow = _aggregatorParams._timeWindow;
		samplingFrequency = timeWindow / sampleSize;
		bribeUnit = _aggregatorParams._bribeUnit;
		axelarGateway = IAxelarGateway(_axelarGateway);
		liquidityManager = ILiquidityManager(_liquidityManager);
		for (uint256 i = 0; i < _tokenInfo.length; i++) {
			tokenInfo.push(_tokenInfo[i]);
			tokenSymbols.push(_tokenInfo[i]._symbol);
			tokens[_tokenInfo[i]._symbol] = i;
			totalSupplies.push(IERC20(_tokenInfo[i]._address).totalSupply());
		}
	}

	// Initialize methods

	// function setTaggingVerifier(address _taggingVerifier) external {
	//     taggingVerifier = TaggingVerifier(_taggingVerifier);
	// }

	function setChainId(uint32 _chainId, uint32 _mainChainId, address _mainChainAddress) external {
		chainId = _chainId;
		mainChainId = _mainChainId;
        mainChainAddress = _mainChainAddress;
	}

    function setDestinationChain(uint64 chainSelectorId, string calldata destinationChain) external {
        chainSelectorIdToDestinationChain[chainSelectorId] = destinationChain;
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

	function updateTokenParams(
		uint256[] memory _totalSupplies,
		uint256[] memory _liquidities
	) external {
		for (uint256 i = 0; i < tokenInfo.length; i++) {
			if (tokenInfo[i]._chainId == chainId) {
				liquidities[i] = liquidityManager.getTotalLiquidityForToken(
					tokenInfo[i]._address
				);
				totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
				tokenParamsTimestampUpdates[i] = block.timestamp;
			}
		}

		if (isMainChain()) {
			for (uint256 i = 0; i < totalSupplies.length; i++) {
				for (uint256 j = 0; j < tokenInfo.length; j++) {
					if (tokenInfo[j]._address == supplyMessages[i].token) {
						totalSupplies[j] = supplyMessages[i].supply;
						tokenParamsTimestampUpdates[j] = supplyMessages[i]
							.timestamp;
					}
					continue;
				}
			}

			for (uint256 i = 0; i < liquidities.length; i++) {
				for (uint256 j = 0; j < tokenInfo.length; j++) {
					if (tokenInfo[j]._address == liquidityMessages[i].token) {
						liquidities[j] = liquidityMessages[i].liquidity;
						tokenParamsTimestampUpdates[j] = liquidityMessages[i]
							.timestamp;
					}
					continue;
				}
			}
		}

		if (!isMainChain()) {
			SupplyMessage[] memory _supplyMessages = new SupplyMessage[](
				tokenInfo.length
			);
			LiquidityMessage[]
				memory _liquidityMessages = new LiquidityMessage[](
					tokenInfo.length
				);
			for (uint256 i = 0; i < tokenInfo.length; i++) {
				if (chainId == tokenInfo[i]._chainId) {
					_supplyMessages[i] = SupplyMessage(
						tokenInfo[i]._address,
						_totalSupplies[i],
						chainId,
						block.timestamp
					);
					_liquidityMessages[i] = LiquidityMessage(
						tokenInfo[i]._address,
                        tokenInfo[i]._symbol,
						_liquidities[i],
						chainId,
						block.timestamp
					);
				}
			}
        
        // execute to main chain using Axelar
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
      }
	}

    function toAsciiString(address x) internal pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
        bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
        bytes1 hi = bytes1(uint8(b) / 16);
        bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
        s[2*i] = char(hi);
        s[2*i+1] = char(lo);            
    }
    return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

	function checkTokenParams() public {
		for (uint256 i = 0; i < tokenInfo.length; i++) {
			if (
				block.timestamp - tokenParamsTimestampUpdates[i] >= timeWindow
			) {
				liquidities[i] = liquidityManager.getTotalLiquidityForToken(
					tokenInfo[i]._address
				);
				totalSupplies[i] = IERC20(tokenInfo[i]._address).totalSupply();
				tokenParamsTimestampUpdates[i] = block.timestamp;
			}
		}
	}

	function receiveFromAxelar(
		IndexUpdateMessage memory indexMessage
	) external {
		// add @axelar-network/axelar-cgp-solidity logic here

		for (uint256 i = 0; i < indexMessage.liquidityMessages.length; i++) {
			LiquidityMessage memory liquidityMessage = indexMessage
				.liquidityMessages[i];
			liquidityMessages.push(liquidityMessage);
		}
		for (uint256 i = 0; i < indexMessage.supplyMessages.length; i++) {
			SupplyMessage memory supplyMessage = indexMessage.supplyMessages[i];
			supplyMessages.push(supplyMessage);
		}
	}

	function collectPriceFeeds() external {
		require(
			block.timestamp - lastSampleTime >= samplingFrequency,
			"IndexAggregator: Sampling frequency not reached"
		);

		if (block.timestamp - lastSampleTime >= timeWindow) {
			for (uint256 i = 0; i < tokenInfo.length; i++) {
				if (movingAverage[i].length > 0) {
					movingAverage[i].pop();
				}
			}
		}

		for (uint256 i = 0; i < tokenInfo.length; i++) {
			(, int256 answer, , , ) = AggregatorV3Interface(
				tokenInfo[i]._aggregator
			).latestRoundData();

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

}