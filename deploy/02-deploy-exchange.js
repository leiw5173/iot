// Deploy Exchange contract
const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy, log } = deployments;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
  const IOT_CONTRACT_ADDR = process.env.IOT_CONTRACT_ADDR;

  let deployerAddr, IOTAddr;
  if (developmentChains.includes(network.name)) {
    const { deployer } = await getNamedAccounts();
    deployerAddr = deployer;
    IOTAddr = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    log("Local network detected! Deploying on Hardhat network.");
  } else if (network.name === "neox") {
    const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
    const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    deployerAddr = deployer.address;
    IOTAddr = IOT_CONTRACT_ADDR;
    log("Neox network detected! Deploying on Neox testnet.");
  }

  console.log("Deploying Exchange with account:", deployerAddr);
  await deploy("Exchange", {
    from: deployerAddr,
    args: [IOTAddr],
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["Exchange", "all"];
