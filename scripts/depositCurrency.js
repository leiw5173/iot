const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

async function depositCurrency() {
  let iotContractAddr, exchangeContractAddr, deployer, alice, bob, provider;
  if (developmentChains.includes(network.name)) {
    console.log("Setting price and goods on development network");
    iotContractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    exchangeContractAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
  } else if (network.name == "neox") {
    console.log("Setting price and goods on neox network");
    iotContractAddr = process.env.IOT_CONTRACT_ADDR;
    exchangeContractAddr = process.env.EXCHANGE_CONTRACT_ADDR;
    provider = new ethers.JsonRpcProvider(process.env.NEOX_RPC_URL);
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else {
    console.log("The network is not supported");
  }

  const iotContract = await ethers.getContractAt("Currency", iotContractAddr);
  const balance = await iotContract.balanceOf(bob.address);
  console.log(`Deployer's balance: ${balance}`);
  const exchangeContract = await ethers.getContractAt(
    "Exchange",
    exchangeContractAddr
  );

  await iotContract.connect(bob).approve(exchangeContractAddr, 1);

  const response = await exchangeContract.connect(bob).depositCurrency(0);

  console.log(response);

  const order = await exchangeContract.getOrder(0);
  console.log(order);

  console.log(`Buyer: ${order[0]}`);
}

depositCurrency()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
