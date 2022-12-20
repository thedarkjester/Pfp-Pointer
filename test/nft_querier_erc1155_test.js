const{
  createTestERC1155All,
  createTestERC1155SupportedNo165,
  createTestERC1155Unsupported
} = require("./shared_setup.js");

const{
  catchRevert
} = require("./exception_helper.js");

const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");

contract("ERC1155NFTQuerier information", function (accounts ) {
  beforeEach(async () => {
    instance = await ERC1155NFTQuerier.new();
  })

  it("Should return querier name", async function () {
    querierName = await instance.getName();
    assert.equal("ERC1155", querierName);
  });

  it("Should return querier description", async function () {
    querierDescription= await instance.getDescription();
    assert.equal("ERC1155", querierDescription);
  });
});


contract("ERC1155NFTQuerier with Full Support", function (accounts ) {
  beforeEach(async () => {
    erc1155Contract = await createTestERC1155All();
    await erc1155Contract.mint(accounts[0],1,1);
    await erc1155Contract.mint(accounts[1],2,1);

    instance = await ERC1155NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[0], 2);
    return assert.isFalse(isSupported);
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[1], 1);
    return assert.isFalse(isSupported);
  });  

  it("Should be supported", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[0] ,1);
    return assert.isTrue(isSupported);
  });

  it("Should be able to get metadata uri", async function () {
    metadataUri = await instance.getTokenMetadataUri(erc1155Contract.address,1);
    assert.equal("https://www.test.com/images/99", metadataUri);

    metadataUri = await instance.getTokenMetadataUri(erc1155Contract.address,2);
    assert.equal("https://www.test.com/images/99", metadataUri);
  });

  it("Should be able to see if address owns token", async function () {
    isOwner = await instance.addressOwnsToken(erc1155Contract.address, accounts[0], 1);
    assert.isTrue(isOwner);
  });

  it("Should be able to see if address doesn't own token", async function () {
    isOwner = await instance.addressOwnsToken(erc1155Contract.address, accounts[0], 2);
    assert.isFalse(isOwner);
  });
});

contract("ERC1155NFTQuerier with only function Support", function (accounts ) {
  beforeEach(async () => {
    erc1155Contract = await createTestERC1155SupportedNo165();
    await erc1155Contract.mint(accounts[0],1,1);
    await erc1155Contract.mint(accounts[1],2,1);

    instance = await ERC1155NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[0], 2);
    return assert.isFalse(isSupported);
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[1], 1);
    assert.isFalse(isSupported);
  });  

  it("Should be supported", async function () {
    isSupported = await instance.isSupported(erc1155Contract.address, accounts[0] ,1);
    assert.isTrue(isSupported);
  });

  it("Should be not supported no longer being a token owner (TokenId) [1]-1", async function () {
     await erc1155Contract.safeTransferFrom(accounts[0], accounts[1], 1 , 1);

     isSupported = await instance.isSupported(erc1155Contract.address, accounts[0], 1);
     return assert.isFalse(isSupported);
  }); 

  it("Should be able to get metadata uri", async function () {
    metadataUri = await instance.getTokenMetadataUri(erc1155Contract.address,1);
    assert.equal("https://www.test.com/images/99", metadataUri);

    metadataUri = await instance.getTokenMetadataUri(erc1155Contract.address,2);
    assert.equal("https://www.test.com/images/99", metadataUri);
  });

  it("Should be able to see if address owns token", async function () {
    isOwner = await instance.addressOwnsToken(erc1155Contract.address, accounts[0], 1);
    assert.isTrue(isOwner);
  });

  it("Should be able to see if address doesn't own token", async function () {
    isOwner = await instance.addressOwnsToken(erc1155Contract.address, accounts[0], 2);
    assert.isFalse(isOwner);
  });
});

contract("ERC1155NFTQuerier with zero Support", function (accounts ) {
  beforeEach(async () => {
    erc1155Contract = await createTestERC1155Unsupported();
    await erc1155Contract.mint(accounts[0],1,1);
    await erc1155Contract.mint(accounts[1],2,1);

    instance = await ERC1155NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    await catchRevert(instance.isSupported(erc1155Contract.address, accounts[0], 2));
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    await catchRevert(instance.isSupported(erc1155Contract.address, accounts[1], 1));
  });  

  it("Should not be supported even if actually owner", async function () {
    await catchRevert(instance.isSupported(erc1155Contract.address, accounts[0], 1));
  });
});