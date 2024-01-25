// Deploy Product Manager contract
const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy, log } = deployments;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
  const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

  let deployerAddr;
  if (developmentChains.includes(network.name)) {
    const { deployer } = await getNamedAccounts();
    deployerAddr = deployer;
    log("Local network detected! Deploying on Hardhat network.");
  } else if (network.name === "neox") {
    const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
    const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    deployerAddr = deployer.address;
    log("Neox network detected! Deploying on Neox testnet.");
  } else if (network.name === "sepolia") {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    deployerAddr = deployer.address;
    log("Sepolia network detected! Deploying on Sepolia testnet.");
  }

  console.log("Deploying Product Manager with account:", deployerAddr);
  await deploy("ProductManager", {
    from: deployerAddr,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["ProductManager", "all"];
