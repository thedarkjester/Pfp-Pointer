const{
  catchRevert,
  catchOutOfBounds
} = require("./exception_helper.js");


const NFTQuerierProvider = artifacts.require("NFTQuerierProvider");
const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");
const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");

contract("NFTQuerierProvider", function (accounts) {

  beforeEach(async () => {
    ERC721NFTQuerierInstance = await ERC721NFTQuerier.new();
    ERC1155NFTQuerierInstance = await ERC1155NFTQuerier.new();
    NFTQuerierProviderInstance = await NFTQuerierProvider.new(ERC721NFTQuerierInstance.address, ERC1155NFTQuerierInstance.address);
  })

  it("Should return all queriers", async function () {
    queriers = await NFTQuerierProviderInstance.getSupportedQueriers();
    assert.equal(ERC721NFTQuerierInstance.address, queriers[0]);
    assert.equal(ERC1155NFTQuerierInstance.address, queriers[1]);
  });

  it("Should revert with negative index", async function () {
    await catchOutOfBounds(NFTQuerierProviderInstance.getQuerierByIndex(-1));
  });

  it("Should revert with out of bounds index", async function () {
    await catchRevert(NFTQuerierProviderInstance.getQuerierByIndex(2));
  });

  it("Should return correct item at index 0", async function () {
    querier = await NFTQuerierProviderInstance.getQuerierByIndex(0);
    assert.equal(ERC721NFTQuerierInstance.address, querier);
  });

  it("Should return correct item at index 1", async function () {
    querier = await NFTQuerierProviderInstance.getQuerierByIndex(1);
    assert.equal(ERC1155NFTQuerierInstance.address, querier);
  });

  it("Can't add owner if not owner", async function () {
    await catchRevert(NFTQuerierProviderInstance.addOwner(accounts[1], {from:accounts[1]}));
  });

  it("Can't add existing owner", async function () {
    await catchRevert(NFTQuerierProviderInstance.addOwner(accounts[0]));
  });

  it("Can add second owner", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]);
   // console.log(NFTQuerierProviderInstance);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[1]);
    assert.isTrue(isOwner);

    isPending = await NFTQuerierProviderInstance.isOwnerPendingApproval(accounts[1]);
    assert.isFalse(isPending);
  });

  it("Can add second owner, but third is pending", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]);
    await NFTQuerierProviderInstance.addOwner(accounts[2]);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[2]);
    assert.isFalse(isOwner);

    isPending = await NFTQuerierProviderInstance.isOwnerPendingApproval(accounts[2]);
    assert.isTrue(isPending);
  });


  it("Can add second owner, third is pending and approval fails for adder", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]);
    await NFTQuerierProviderInstance.addOwner(accounts[2]);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[2]);

    await catchRevert(NFTQuerierProviderInstance.approveOwner(accounts[2],{from:accounts[0]}));
  });

  it("Can add second owner, and third is approved when second owner votes it in", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]);
    await NFTQuerierProviderInstance.addOwner(accounts[2]);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[2]);

    await NFTQuerierProviderInstance.approveOwner(accounts[2],{from:accounts[1]});

    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[2]);
    assert.isTrue(isOwner);

    isPending = await NFTQuerierProviderInstance.isOwnerPendingApproval(accounts[2]);
    assert.isFalse(isPending);
  });

  it("Can add second + third owner, and fourth is approved when third owner votes it in", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]);
    await NFTQuerierProviderInstance.addOwner(accounts[2]);
    await NFTQuerierProviderInstance.approveOwner(accounts[2],{from:accounts[1]});
    await NFTQuerierProviderInstance.addOwner(accounts[3],{from:accounts[2]});
    await NFTQuerierProviderInstance.approveOwner(accounts[3],{from:accounts[1]});
    isPending = await NFTQuerierProviderInstance.isOwnerPendingApproval(accounts[3]);
    assert.isTrue(isPending);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[3]);
    assert.isFalse(isOwner);

    await NFTQuerierProviderInstance.approveOwner(accounts[3]);

    isPending = await NFTQuerierProviderInstance.isOwnerPendingApproval(accounts[3]);
    assert.isFalse(isPending);
    isOwner = await NFTQuerierProviderInstance.isOwner(accounts[3]);
    assert.isTrue(isOwner);
  });

  it("Can add 2 extra owners, and can't double vote", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]); // auto approved 1/1
    await NFTQuerierProviderInstance.addOwner(accounts[2]); // pending 1/2
    await NFTQuerierProviderInstance.approveOwner(accounts[2],{from:accounts[1]}); // approved 2/2
    await NFTQuerierProviderInstance.addOwner(accounts[3],{from:accounts[2]}); // pending - 1/3
    await NFTQuerierProviderInstance.approveOwner(accounts[3],{from:accounts[1]}); // pending 2/3 
    await catchRevert(NFTQuerierProviderInstance.approveOwner(accounts[3],{from:accounts[1]})); // failed double vote
  });

  it("Can't register an existing querier", async function () {
    await catchRevert(NFTQuerierProviderInstance.registerQuerier(ERC721NFTQuerierInstance.address));
  });

  it("Can't register an existing querier", async function () {
    await catchRevert(NFTQuerierProviderInstance.registerQuerier(ERC1155NFTQuerierInstance.address));
  });

  it("Single owner can register a new querier", async function () {
    ERC721NFTQuerier_second = await ERC721NFTQuerier.new();
    await NFTQuerierProviderInstance.registerQuerier(ERC721NFTQuerier_second.address);

    querier = await NFTQuerierProviderInstance.getQuerierByIndex(2);
    assert.equal(ERC721NFTQuerier_second.address, querier);
  });

  
  it("Owner can register a new querier with second owner and can't double vote", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]); 

    ERC721NFTQuerier_second = await ERC721NFTQuerier.new();
    await NFTQuerierProviderInstance.registerQuerier(ERC721NFTQuerier_second.address);

    await catchRevert(NFTQuerierProviderInstance.getQuerierByIndex(2));

    await catchRevert(NFTQuerierProviderInstance.approveQuerier(ERC721NFTQuerier_second.address));

    await catchRevert(NFTQuerierProviderInstance.getQuerierByIndex(2));
  });

  it("Owner can register a new querier but second owner needs to vote it in", async function () {
    await NFTQuerierProviderInstance.addOwner(accounts[1]); 

    ERC721NFTQuerier_second = await ERC721NFTQuerier.new();
    await NFTQuerierProviderInstance.registerQuerier(ERC721NFTQuerier_second.address);

    await catchRevert(NFTQuerierProviderInstance.getQuerierByIndex(2));
    await NFTQuerierProviderInstance.approveQuerier(ERC721NFTQuerier_second.address, {from:accounts[1]});

    querier = await NFTQuerierProviderInstance.getQuerierByIndex(2);
    assert.equal(ERC721NFTQuerier_second.address, querier);
  });
});
