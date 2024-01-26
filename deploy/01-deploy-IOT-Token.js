// SPDX-License-Identifier: MIT

// Deploy IOT Token

const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NEOX_RPC_URL = process.env.NEOX_RPC_URL;
  const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
  const { deploy } = deployments;
  let deployer, alice, bob, provider;

  // Check the network to see if it's a local or a testnet
  if (developmentChains.includes(network.name)) {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
  } else if (network.name == "neox") {
    const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
  } else if (network.name == "sepolia") {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    deployer = new ethers.Wallet(PRIVATE_KEY, provider);
    alice = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
    bob = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
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

  // send tokens to alice and bob
  const iotContract = await ethers.getContractAt("Currency", iotToken.address);
  await iotContract.connect(deployer).transfer(alice.address, 1000 * 10 ** 10);
  await iotContract.connect(deployer).transfer(bob.address, 1000 * 10 ** 10);
  await sleep(11000);

  console.log("Transfered 1000 IOT Tokens to Alice and Bob");
  console.log(
    "Alice's balance: ",
    (await iotContract.balanceOf(alice.address)).toString()
  );
  console.log(
    "Bob's balance: ",
    (await iotContract.balanceOf(bob.address)).toString()
  );
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.tags = ["Currency", "all"];
