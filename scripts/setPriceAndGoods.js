const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function setPriceAndGoods() {
  let exchangeContractAddr, deployer, alice, bob, provider, sleepTime;
  const multiplier = 10 ** 10;
  if (developmentChains.includes(network.name)) {
    console.log("Setting price and goods on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    sleepTime = 1000;
  } else if (network.name == "neox") {
    console.log("Setting price and goods on neox network");
    iotContractAddr = process.env.IOT_CONTRACT_ADDR;
    exchangeContractAddr = process.env.EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.NEOX_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
    sleepTime = 12000;
  } else if (network.name == "sepolia") {
    console.log("Setting price and goods on goerli network");
    iotContractAddr = process.env.SEPOLIA_CURRENCY_CONTRACT_ADDR;
    exchangeContractAddr = process.env.SEPOLIA_EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
    sleepTime = 12000;
  } else {
    console.log("The network is not supported");
  }

  const exchangeContract = await ethers.getContractAt(
    "Exchange",
    exchangeContractAddr
  );
  const tx = await exchangeContract
    .connect(alice)
    .setPriceAndGoods("100 Stones", 1 * multiplier);
  await tx.wait();
  await sleep(sleepTime);

  const orderNumber = await exchangeContract.connect(alice).orderNumber();

  console.log(orderNumber.toString());

  const order = await exchangeContract.connect(alice).getOrder(orderNumber);
  console.log(order);

  console.log(`OrderID: ${order[0]}`);
  console.log(`Buyer: ${order[1]}`);
  console.log(`Seller: ${order[2]}`);
  console.log(`Price: ${order[3]}`);
  console.log(`Name: ${order[4]}`);
  console.log(`Status: ${order[5]}`);
}

// Time deplay function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setPriceAndGoods()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
