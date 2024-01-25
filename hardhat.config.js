require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
require("hardhat-deploy");

const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
    neox: {
      url: NEOX_RPC_URL,
      chainId: 12227329,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2],
      blockConfirmations: 2,
      gas: 12000000,
      gasPrice: 1000000000000,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      chainId: 5,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2],
      blockConfirmations: 5,
      gas: 12000000,
      gasPrice: 1000000000000,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2],
      blockConfirmations: 5,
      // gas: 12000000,
      // gasPrice: 1000000000000,
    },
  },
  solidity: "0.8.20",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 1,
    },
    bob: {
      default: 2,
    },
  },
};
