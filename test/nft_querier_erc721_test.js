const{
  createTestERC721All,
  createTestERC721SupportedNo165,
  createTestERC721Unsupported
} = require("./shared_setup.js");

const{
  catchRevert
} = require("./exception_helper.js");

const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");

contract("createTestERC721All test", function (accounts ) {
  beforeEach(async () => {
   erc721Contract = await createTestERC721All();
  })

  it("Should support Interface", async function () {
    supportsInterface = await instance.supportsInterface("0x5b5e139f");
    assert.isTrue(supportsInterface);
  });
});

contract("ERC721NFTQuerier information", function (accounts ) {
  beforeEach(async () => {
    instance = await ERC721NFTQuerier.new();
  })

  it("Should return querier name", async function () {
    querierName = await instance.getName();
    assert.equal("ERC721", querierName);
  });

  it("Should return querier description", async function () {
    querierDescription= await instance.getDescription();
    assert.equal("ERC721 or ERC721A", querierDescription);
  });
});


contract("ERC721NFTQuerier with Full Support", function (accounts ) {
  beforeEach(async () => {
    erc721Contract = await createTestERC721All();
    await erc721Contract.mint(accounts[0],1);
    await erc721Contract.mint(accounts[1],2);

    instance = await ERC721NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[0], 2);
    return assert.isFalse(isSupported);
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[1], 1);
    return assert.isFalse(isSupported);
  });  

  it("Should be supported", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[0] ,1);
    return assert.isTrue(isSupported);
  });

  it("Should be able to get metadata uri", async function () {
    metadataUri = await instance.getTokenMetadataUri(erc721Contract.address,1);
    assert.equal("https://www.test.com/images/1", metadataUri);

    metadataUri = await instance.getTokenMetadataUri(erc721Contract.address,2);
    assert.equal("https://www.test.com/images/2", metadataUri);
  });

  it("Should be able to see if address owns token", async function () {
    isOwner = await instance.addressOwnsToken(erc721Contract.address, accounts[0], 1);
    assert.isTrue(isOwner);
  });

  it("Should be able to see if address doesn't own token", async function () {
    isOwner = await instance.addressOwnsToken(erc721Contract.address, accounts[0], 2);
    assert.isFalse(isOwner);
  });
});

contract("ERC721NFTQuerier with only function Support", function (accounts ) {
  beforeEach(async () => {
    erc721Contract = await createTestERC721SupportedNo165();
    await erc721Contract.mint(accounts[0],1);
    await erc721Contract.mint(accounts[1],2);

    instance = await ERC721NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[0], 2);
    return assert.isFalse(isSupported);
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[1], 1);
    assert.isFalse(isSupported);
  });  

  it("Should be supported", async function () {
    isSupported = await instance.isSupported(erc721Contract.address, accounts[0] ,1);
    assert.isTrue(isSupported);
  });

  it("Should be not be supported no longer being a token owner (TokenId) [1]-1", async function () {
    await erc721Contract.transferFrom(accounts[0], accounts[1], 1);

     isSupported = await instance.isSupported(erc721Contract.address, accounts[0], 1);
     return assert.isFalse(isSupported);
  }); 

  it("Should be able to get metadata uri", async function () {
    metadataUri = await instance.getTokenMetadataUri(erc721Contract.address,1);
    assert.equal("https://www.test.com/images/1", metadataUri);

    metadataUri = await instance.getTokenMetadataUri(erc721Contract.address,2);
    assert.equal("https://www.test.com/images/2", metadataUri);
  });

  it("Should be able to see if address owns token", async function () {
    isOwner = await instance.addressOwnsToken(erc721Contract.address, accounts[0], 1);
    assert.isTrue(isOwner);
  });

  it("Should be able to see if address doesn't own token", async function () {
    isOwner = await instance.addressOwnsToken(erc721Contract.address, accounts[0], 2);
    assert.isFalse(isOwner);
  });
});

contract("ERC721NFTQuerier with zero Support", function (accounts ) {
  beforeEach(async () => {
    erc721Contract = await createTestERC721Unsupported();
    await erc721Contract.mint(accounts[0],1);
    await erc721Contract.mint(accounts[1],2);

    instance = await ERC721NFTQuerier.new();
  })

  it("Should be not supported missing matching interface or functions", async function () {
     await catchRevert(instance.isSupported(instance.address, accounts[0], 1));
  });

  it("Should be not supported not being a token owner (TokenId) [0]-2", async function () {
    await catchRevert(instance.isSupported(erc721Contract.address, accounts[0], 2));
  });

  it("Should be not supported not being a token owner (TokenId) [1]-1", async function () {
    await catchRevert(instance.isSupported(erc721Contract.address, accounts[1], 1));
  });  

  it("Should not be supported even if actually owner", async function () {
    await catchRevert(instance.isSupported(erc721Contract.address, accounts[0], 1));
  });
});