//   const NFTQuerierProvider = artifacts.require("NFTQuerierProvider");
//   const ERC721NFTQuerier = artifacts.require("ERC721NFTQuerier");
//   const ERC1155NFTQuerier = artifacts.require("ERC1155NFTQuerier");
//   const PFPPointer = artifacts.require("PFPPointer");
  
//   contract("PFPPointer", function (accounts) {
    
//     beforeEach(async () => {
//       PFPPointerInstance = await PFPPointer.new("0x6dc798D57Cd335853C78d798e0079FE8B1227494");
//     })
  
//     it("Should return the 721 pfp uri", async function () {
//       await PFPPointerInstance.registerStandardPfpPointer("0xa145e2728eed17e76fb4bf1ed4b0ec93fe63ffc8", 1); 
//       details = await PFPPointerInstance.getMetadataDetails(accounts[0]);
//       console.log(details);
//       assert.equal(details.uri,"https://www.test.com/images/1");
//       assert.equal(details.standardSupported,"ERC721 or ERC721A");
//     });
//   });
  