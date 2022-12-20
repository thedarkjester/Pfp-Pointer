const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");
const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");
const NFTQuerierProvider = artifacts.require("NFTQuerierProvider");
const PFPPointer = artifacts.require("PFPPointer");

module.exports = async function (deployer,network,accounts) {
  await deployer.deploy(ERC721NFTQuerier);
  await deployer.deploy(ERC1155NFTQuerier);

  await deployer.deploy(NFTQuerierProvider,ERC721NFTQuerier.address, ERC1155NFTQuerier.address);

  await deployer.deploy(PFPPointer, NFTQuerierProvider.address);
};
