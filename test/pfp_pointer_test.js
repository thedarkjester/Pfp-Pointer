
const{
  catchRevert
} = require("./exception_helper.js");

const{
  createTestERC721All,
  createTestERC1155All
} = require("./shared_setup.js");


const NFTQuerierProvider = artifacts.require("NFTQuerierProvider");
const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");
const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");
const PFPPointer = artifacts.require("PFPPointer");

contract("PFPPointer", function (accounts) {
  
  beforeEach(async () => {
    ERC721NFTQuerierInstance = await ERC721NFTQuerier.new();
    ERC1155NFTQuerierInstance = await ERC1155NFTQuerier.new();
    NFTQuerierProviderInstance = await NFTQuerierProvider.new(ERC721NFTQuerierInstance.address, ERC1155NFTQuerierInstance.address);

    PFPPointerInstance = await PFPPointer.new(NFTQuerierProviderInstance.address);

    erc721Contract = await createTestERC721All();
    await erc721Contract.mint(accounts[0],1);
    await erc721Contract.mint(accounts[1],2);

    erc1155Contract = await createTestERC1155All();
    await erc1155Contract.mint(accounts[0],1,1);
    await erc1155Contract.mint(accounts[1],2,1);
  })

  it("Should register the 721 pfp", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 1); 
  });

  it("Should return the 721 pfp uri", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");
  });

  it("Should return the 721 pfp uri and return nothing if no longer owner", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");

    await erc721Contract.transferFrom(accounts[0], accounts[1], 1);

    await catchRevert(PFPPointerInstance.getMetadataDetails(accounts[0]));
  });
  
  it("Should register the 1155 pfp", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc1155Contract.address, 1); 
  });

  it("Should return the 1155 pfp uri", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc1155Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");
  });

  it("Should return the 1155 pfp uri and return error if no longer owner", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc1155Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");

    await erc1155Contract.safeTransferFrom(accounts[0], accounts[1], 1 , 1,[]);

    await catchRevert(PFPPointerInstance.getMetadataDetails(accounts[0]));
  });

  it("Can change PFP registration", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc1155Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");

    await PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");
  });

  it("Can't register ERC1155 by bad index", async function () {
    await catchRevert(PFPPointerInstance.registerPfpPointerByIndex(erc1155Contract.address, 1, 2)); 
  });

  it("Can't register ERC721 by bad index", async function () {
    await catchRevert(PFPPointerInstance.registerPfpPointerByIndex(erc721Contract.address, 1, 2)); 
  });

  it("Can't register ERC721 as ERC1155", async function () {
    await catchRevert(PFPPointerInstance.registerPfpPointerByIndex(erc721Contract.address, 1, 1)); 
  });

  it("Can't register ERC1155 as ERC721", async function () {
    await catchRevert(PFPPointerInstance.registerPfpPointerByIndex(erc1155Contract.address, 1, 0)); 
  });

  it("Can register ERC1155 by index", async function () {
    await PFPPointerInstance.registerPfpPointerByIndex(erc1155Contract.address, 1, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");
  });

  it("Can register ERC721 by index", async function () {
    await PFPPointerInstance.registerPfpPointerByIndex(erc721Contract.address, 1, 0); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");
  });

  it("Can register ERC721 by index and swap to ERC1155 by index", async function () {
    await PFPPointerInstance.registerPfpPointerByIndex(erc721Contract.address, 1, 0); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");

    await PFPPointerInstance.registerPfpPointerByIndex(erc1155Contract.address, 1, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");
  });

  it("Can register ERC721 and swap to ERC1155", async function () {
    await PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/1");
    assert.equal(details.standardSupported,"ERC721 or ERC721A");

    await PFPPointerInstance.registerStandardPfpPointer(erc1155Contract.address, 1); 
    details = await PFPPointerInstance.getMetadataDetails(accounts[0]);

    assert.equal(details.uri,"https://www.test.com/images/99");
    assert.equal(details.standardSupported,"ERC1155");
  });

  it("Should not return if unregistered", async function () {
    await catchRevert(PFPPointerInstance.getMetadataDetails(accounts[0]));
  });

  it("Should not be supported missing matching interface or functions", async function () {
    await catchRevert(PFPPointerInstance.registerStandardPfpPointer(erc721Contract.address, 2)); 
    await catchRevert(PFPPointerInstance.registerStandardPfpPointer(PFPPointerInstance.address, 2));  // not owner
  });

  it("Non owner can't change provider", async function () {
    await catchRevert(PFPPointerInstance.changeProvider(PFPPointerInstance.address,{from:accounts[1]}));
  });

  it("owner can change provider", async function () {
    await PFPPointerInstance.changeProvider(PFPPointerInstance.address);
  });

  it("Non owner can't change owner", async function () {
    await catchRevert(PFPPointerInstance.changeOwnership(accounts[1],{from:accounts[1]}));
  });

  it("owner can change owner and original owner can't", async function () {
    await PFPPointerInstance.changeOwnership(accounts[1]);
    await catchRevert(PFPPointerInstance.changeOwnership(accounts[0],{from:accounts[0]}));
  });

  it("Non owner can't burn ownership", async function () {
    await catchRevert(PFPPointerInstance.burnOwnership({from:accounts[1]}));
  });

  it("owner can burn ownership and then fails as not owner", async function () {
    await PFPPointerInstance.burnOwnership({from:accounts[0]});
    await catchRevert(PFPPointerInstance.burnOwnership({from:accounts[0]}));
  });
});
