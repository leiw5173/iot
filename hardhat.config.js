require("@nomicfoundation/hardhat-toolbox");
require;
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
  },
  solidity: "0.8.20",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
