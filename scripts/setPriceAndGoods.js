const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function setPriceAndGoods() {
  let exchangeContractAddr, deployer, alice, bob, provider, sleepTime;
  if (developmentChains.includes(network.name)) {
    console.log("Setting price and goods on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
    sleepTime = 6000;
  } else if (network.name == "goerli") {
    console.log("Setting price and goods on goerli network");
    iotContractAddr = process.env.GOERLI_CURRENCY_CONTRACT_ADDR;
    exchangeContractAddr = process.env.GOERLI_EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.GOERLI_RPC_URL);
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
  await exchangeContract.connect(alice).setPriceAndGoods(1, 100);
  await sleep(sleepTime);

  console.log(await exchangeContract.connect(alice).orderNumber());

  const order = await exchangeContract.connect(alice).getOrder(0);
  console.log(order);

  console.log(`Seller: ${order[1]}`);
  console.log(`Price: ${order[2]}`);
  console.log(`Amount: ${order[3]}`);
  console.log(`Status: ${order[4]}`);
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
