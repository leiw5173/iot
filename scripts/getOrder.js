const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function getOrder() {
  let iotContractAddr, exchangeContractAddr, deployer, alice, bob, provider;
  if (developmentChains.includes(network.name)) {
    console.log("Checking balances on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
  } else if (network.name == "neox") {
    console.log("Checking balances on neox network");
    iotContractAddr = process.env.IOT_CONTRACT_ADDR;
    exchangeContractAddr = process.env.EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.NEOX_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else if (network.name == "sepolia") {
    console.log("Checking balances on sepolia network");
    iotContractAddr = process.env.SEPOLIA_CURRENCY_CONTRACT_ADDR;
    exchangeContractAddr = process.env.SEPOLIA_EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else {
    console.log("The network is not supported");
  }

  const orderContract = await ethers.getContractAt(
    "Exchange",
    exchangeContractAddr
  );
  order = await orderContract.getOrder(process.env.ORDER_ID);

  console.log(`OrderID: ${order[0]}`);
  console.log(`Buyer: ${order[1]}`);
  console.log(`Seller: ${order[2]}`);
  console.log(`Price: ${order[3]}`);
  console.log(`Name: ${order[4]}`);
  console.log(`Status: ${order[5]}`);
}

getOrder()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
