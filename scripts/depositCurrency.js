const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function depositCurrency() {
  let iotContractAddr, exchangeContractAddr, deployer, alice, bob, provider;
  const orderNumber = 0;
  const multiplier = 10 ** 10;
  if (developmentChains.includes(network.name)) {
    console.log("Setting price and goods on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
  } else if (network.name == "neox") {
    console.log("Deposit currency on neox network");
    iotContractAddr = process.env.IOT_CONTRACT_ADDR;
    exchangeContractAddr = process.env.EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.NEOX_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else if (network.name == "goerli") {
    console.log("Deposit currency on goerli network");
    iotContractAddr = process.env.GOERLI_CURRENCY_CONTRACT_ADDR;
    exchangeContractAddr = process.env.GOERLI_EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.GOERLI_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else {
    console.log("The network is not supported");
  }

  const iotContract = await ethers.getContractAt("Currency", iotContractAddr);
  const balance = await iotContract.balanceOf(bob.address);
  console.log(`Bob's balance: ${balance}`);
  const exchangeContract = await ethers.getContractAt(
    "Exchange",
    exchangeContractAddr
  );

  await iotContract.connect(bob).approve(exchangeContractAddr, 1 * multiplier);

  const orderBefore = await exchangeContract.getOrder(orderNumber);
  console.log(orderBefore);
  console.log(`Price: ${orderBefore[2]}`);

  const response = await exchangeContract
    .connect(bob)
    .depositCurrency(orderNumber);

  // console.log(response);

  const order = await exchangeContract.getOrder(orderNumber);
  console.log(order);

  console.log(`Buyer: ${order[orderNumber]}`);
}

depositCurrency()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
