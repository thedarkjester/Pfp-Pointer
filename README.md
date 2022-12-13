# Pfp-Pointer
On chain Registry for setting a preferred NFT profile picture

## Purpose
The aim of this project is to have an on-chain registry where any person can set their preferred NFT as a their profile picture.

Additionally, any dapp will be able to easily retrieve the metadata uri for the wallet connected to their dapp if it is registered. The dapp will then be able to personalise the user experience based on that metadata uri, by retrieving the metadata and NFT image.

For now, interaction is on Etherscan under contracts, but a UI is being built as well as components for dapps to integrate with. See notes below on components (tl;dr - fork and submit PR)

## Deployed Addresses

**Note:** The contracts have all been verified and source will be published here as well.

All the addresses below are the same on:
- Ethereum Mainnet
- Sepolia Testnet
- Goerli Testnet
- Polygon Mainnet
- Mumbai Mainnet

The Ethereum Mainnet address has ENS addresses associated to it:
- pfp-pointer.eth
- pfppointer.eth

### PFP Pointer Address
https://etherscan.io/address/0x5330abcd778d5ae2e242dfd088682640bac03506

### Query Provider Address
https://etherscan.io/address/0xa25da47cc55c072cee3804272725df0759e51779

### ERC-721 Querier
https://etherscan.io/address/0x12fdbbff654c4a3c39ad1ade8ad679ad0763cdb6

### ERC-1155 Querier
https://etherscan.io/address/0x5c01cebf16e69ed9ed10fee24713ca11c84a4ad1

## Technical details

### Queriers and their provider
The main contract that people interact with has a `provider` contract address defined on it that is used to retrieve a collection of `queriers` that validates the registration data provided by a user for all supported standards. By default the provider has two queriers; the ERC-721 querier and the ERC-1155 queriers.

### Registration
There are two methods of registration:
1. Auto detect - this will check the user provided NFT contract for a contract standard it supports. It first checks ERC-721, then ERC-1155, and then if any others are defined those (e.g. custom or future standards) **Note**:  the checking stops on the first successful standard found. This is the more expensive of the two methods, but the simplest.

2. By index. If a user specifies the index of a querier index in the known collection, only that one will be checked. This method is cheaper, but requires knowing the querier index. To know which is which, the main contract exposes the provider address, which can be used to retrieve the queriers and then the name/description on each querier.

Checks for all standards will validate user ownership of the NFT on registration or querying (i.e. you can't register, sell the NFT and expect to use it as a PFP)

**Note**: New queriers can be added for non-standard NFTs, as long as they comply to the `IQueryNFTs` and have been voted in.

### Metadata uri retrieval
The contract exposes a call to get the metadata uri, which depending on the standard used/defined at registration, will retrieve the particular querier, which will then get the metadata uri (as it knows the functions to call)

**Note** The ownership is checked at each query.

### Roadmap
In the interest of interoperability, adoption and user experience, the intended roadmap is to build/work on the following:

#### Ownership burning, multisigs and ENS names
1. Once we believe the main contract is in use and stable (it has been tested), we will burn the ownership of the main contract to remove single point of failure/manipulation concerns.

2. There will be a time where we will add an additional community owners of the provider as separate contracts (or just owners) to remove single failure points. This will be done in a way that majority can be reached without The Dark Jester

3. The ENS registrations are currently set for 3 years, but hopefully way before then, funds will be secured to extend it dramatically, at which point ownership and control will be burnt (or possibly controlled by the community)


#### Javascript framework components/plugins/widgets 
Theae are plugins to manage pfp registration as well as retrieving the user's pfp metadata uri, as well as a display image component. 

The initial frameworks to be targeted are;
- React
- Vue
- Next
- Angular

And other framework can be suggested (or built and submitted via a pull request from a developer fork)

#### MetaMask snaps
Similar functionalityn to the snap will be built, with the hope that a user's NFT collection in MetaMask is exposed.

If other wallets support similar functionality, community development is accepted via pull requests.

#### Future standards
If new standards are created for NFTs that support metadata uris and ownership, those can be added to the provider. **Note**: as part of the provider ownership, a multisig is used to approve new queriers (if there is more than one owner)

#### Non-standard NFTs
Similar to future standards, additional queriers can be added for contracts that have metadata uris and ownership, but do not conform to current defined standards. These can be suggested via:

- an issue on this repository requesting addition of the contract at a deployed address
- Uri to the deployed address on Etherscan with the verified contract
- Uri to an expected NFT that has verified contract information on Etherscan as a sample for verification.
- A pull request to this repository with tests, a sample test NFT showing supported functionality

## FAQ
- Why did you build or are building this?
- - To contribute to the community
- - Provide an easy way for *anyone* to register their NFT
- - Provide components for dapps to personalise NFTs
- - Improve skills
- Are you expecting money for this?
- - No, this is a gift to the community. We are open to tips if people feel inclined.
- - The only money we may hope for in the future is to extend the ENS registrations ridiculously far into the future, and then set ownership to the burn address to remove single user control (or set shared control).
- Is it centralised? who owns/manages the main contract?
- - The Dark Jester currently manages the main contract, however, a burn ownership function will be called once the contract is stable. After the burn, the provider or owner cannot be changed
- Who owns provider contract?
- - This is currently only the Dark Jester, however a multisig approach has been taken to add new owners and new queriers.  Both ownership and querier addition requires a minimum of 67 percentage to make the change.
- I have a non-standard NFT, how do I get it supported.
- - Open an issue on this repository, pointing to a verified contract supporting the `IQueryNFTs` interface.

## Known error responses (this bit is a WIP)

## Registering
- Contract address is wrong
- Contract address is unsupported for known standards (see custom queriers)
- TokenId not owned by the requested address
- Contract provided is not a contract
- Contract provided is not valid
- Contract provided is not supported

### Retrieving
- No registered PFP NFT
- No longer owner of the NFT
- Contract is no longer (possible self-destruct) available
- Contract provided is not a contract
- Contract provided is not valid
- Contract provided is not supported
