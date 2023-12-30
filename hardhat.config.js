require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
require("hardhat-deploy");

const { NEOX_RPC_URL, PRIVATE_KEY } = process.env;

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
      chainId: 12227,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 2,
    },
  },
  solidity: "0.8.20",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
