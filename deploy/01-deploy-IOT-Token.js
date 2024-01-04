// SPDX-License-Identifier: MIT

// Deploy IOT Token

const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
  const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
  const { deploy } = deployments;
  let deployer;

  // Check the network to see if it's a local or a testnet
  if (developmentChains.includes(network.name)) {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
  } else if (network.name == "neox") {
    const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  } else if (network.name == "goerli") {
    const provider = new ethers.JsonRpcProvider(GOERLI_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  } else {
    console.log("The network is not supported");
  }

  // const { deployer } = await getNamedAccounts();
  console.log("Deploying IOT Token with account:", deployer.address);
  const iotToken = await deploy("Currency", {
    from: deployer.address,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("IOT Token deployed to:", iotToken.address);
};

module.exports.tags = ["Currency", "all"];
