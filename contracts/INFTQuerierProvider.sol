// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IQueryNFTTokens.sol";

interface INFTQuerierProvider{
    function getSupportedQueriers() external view returns (IQueryNFTTokens[] memory queriers);
    function registerQuerier(address querier) external;
    function getQuerierByIndex(uint256 index) external view returns (IQueryNFTTokens querier);
}