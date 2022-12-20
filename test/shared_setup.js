const NFTQuerierProvider = artifacts.require("NFTQuerierProvider");
const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");
const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");
const PFPPointer = artifacts.require("PFPPointer");
const _TestERC721All = artifacts.require("_TestERC721All");
const _TestERC721SupportedNo165 = artifacts.require("_TestERC721SupportedNo165");
const _TestERC721Unsupported = artifacts.require("_TestERC721Unsupported");
const _TestERC1155All = artifacts.require("_TestERC1155All");
const _TestERC1155SupportedNo165 = artifacts.require("_TestERC1155SupportedNo165");
const _TestERC1155Unsupported = artifacts.require("_TestERC1155Unsupported");

module.exports = {
    createTestERC721All: async function() {
        instance = await _TestERC721All.new("MyERC721","MES");
        return instance;
    },
    createTestERC721SupportedNo165: async function() {
        instance = await _TestERC721SupportedNo165.new("MyERC721","MES");
        return instance;
    },
    createTestERC721Unsupported: async function() {
        instance = await _TestERC721Unsupported.new();
        return instance;
    },
    createTestERC1155All: async function() {
        instance = await _TestERC1155All.new("https://www.test.com/images/99");
        return instance;
    },
    createTestERC1155SupportedNo165: async function() {
        instance = await _TestERC1155SupportedNo165.new("https://www.test.com/images/99");
        return instance;
    },
    createTestERC1155Unsupported: async function() {
        instance = await _TestERC1155Unsupported.new("https://www.test.com/images/99");
        return instance;
    },            
    create721Querier : async function() {
        instance = await ERC721NFTQuerier.new();
        return instance;
    },
    create1155Querier : async function() {
        instance = await ERC1155NFTQuerier.new();
        return instance;
    },    
    createQuerierProvider : async function() {
        instance721Querier = await ERC721NFTQuerier.new();
        instance1155Querier = await ERC1155NFTQuerier.new();
        instance = await NFTQuerierProvider.new(instance721Querier,instance1155Querier);
        return instance;
    },            
    //getCurrentTime and used under"CC-BY-SA 4.0" license
    //https://kauri.io/truffle-testing-your-smart-contract/f95f956261494090be1aaa8227464773/a
    getCurrentTime : async function() {
        return new Promise(function(resolve) { web3.eth.getBlock("latest").then(function(block) { resolve(block.timestamp) }); }) 
    },
    increaseTimeInSeconds : function increaseTimeInSeconds(increaseInSeconds) {
        return new Promise(function(resolve) {
            web3.currentProvider.send({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [increaseInSeconds],
                id: new Date().getTime()
            }, resolve);
        });
    },
    dayInSeconds : 86400,
    emptyAddress : '0x0000000000000000000000000000000000000000'
}