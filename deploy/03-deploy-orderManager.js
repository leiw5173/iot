// Deploy Exchange contract
const { ethers, network, upgrades } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async function ({ deployments, getNamedAccounts, ethers }) {
  const { log } = deployments;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
  const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

  let deployer, deployerAddr, IOTAddr, productManagerAddr;
  if (developmentChains.includes(network.name)) {
    deployer = (await getNamedAccounts()).deployer;
    deployerAddr = deployer;
    IOTAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    productManagerAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    log("Local network detected! Deploying on Hardhat network.");
  } else if (network.name === "neox") {
    const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    deployerAddr = deployer.address;
    IOTAddr = process.env.IOT_CONTRACT_ADDR;
    log("Neox network detected! Deploying on Neox testnet.");
  } else if (network.name === "sepolia") {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    deployerAddr = deployer.address;
    IOTAddr = process.env.SEPOLIA_CURRENCY_CONTRACT_ADDR;
    productManagerAddr = process.env.SEPOLIA_PRODUCT_CONTRACT_ADDR;
    log("Sepolia network detected! Deploying on Sepolia testnet.");
  }

  console.log("Deploying Exchange with account:", deployerAddr);
  const Exchange = await ethers.getContractFactory("Exchange");
  const proxy = await upgrades.deployProxy(
    Exchange,
    [IOTAddr, productManagerAddr],
    { deployer, initializer: "initialize", kind: "transparent" }
  );
  console.log("OrderManager deployed to:", await proxy.getAddress());
};

module.exports.tags = ["OrderManager", "all"];
