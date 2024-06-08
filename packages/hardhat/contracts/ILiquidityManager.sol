// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILiquidityManager {
    function getTotalLiquidityForToken(address token) external view returns (uint128 totalLiquidity);
}