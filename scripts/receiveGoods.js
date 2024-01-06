const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function receiveGoods() {
  let iotContractAddr,
    exchangeContractAddr,
    deployer,
    alice,
    bob,
    provider,
    sleepTime;
  const orderNumber = 0;
  const multiplier = 10 ** 10;
  if (developmentChains.includes(network.name)) {
    console.log("Receiving goods on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    sleepTime = 0; // no need to wait for mining
  } else if (network.name == "neox") {
    console.log("Receiving goods on neox network");
    iotContractAddr = process.env.IOT_CONTRACT_ADDR;
    exchangeContractAddr = process.env.EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.NEOX_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
    sleepTime = 5000; // wait for 5 seconds for mining
  } else if (network.name == "goerli") {
    console.log("Receiving goods on goerli network");
    iotContractAddr = process.env.GOERLI_CURRENCY_CONTRACT_ADDR;
    exchangeContractAddr = process.env.GOERLI_EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.GOERLI_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
    sleepTime = 12000; // wait for 12 seconds for mining
  } else {
    console.log("The network is not supported");
  }

  // check balance of Alice
  const iotContract = await ethers.getContractAt("Currency", iotContractAddr);
  const balanceBefore = await iotContract.balanceOf(alice.address);
  console.log(`Alice's balance before exchange: ${balanceBefore}`);

  // Bob confirm to receive goods
  const exchangeContract = await ethers.getContractAt(
    "Exchange",
    exchangeContractAddr
  );
  const tx = await exchangeContract.connect(bob).receiveGoods(orderNumber);
  await tx.wait();
  await sleep(sleepTime);

  // check balance of Alice
  const balanceAfter = await iotContract.balanceOf(alice.address);
  console.log(`Alice's balance after exchange: ${balanceAfter}`);

  // check the status of the order
  const order = await exchangeContract.getOrder(orderNumber);
  console.log(`Order status: ${order[4]}`);
}

// Time deplay function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

receiveGoods()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
