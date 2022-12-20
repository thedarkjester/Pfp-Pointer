// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IQueryNFTTokens{
    function addressOwnsToken(address _contractAddress, address owner, uint256 tokenId) external view returns (bool);
    function getTokenMetadataUri(address _contractAddress, uint256 tokenId) external view returns (string memory);
    function isSupported(address _contractAddress, address owner, uint256 tokenId) external view returns (bool);
    function getName() external pure returns (string memory);
    function getDescription() external pure returns (string memory);
}
