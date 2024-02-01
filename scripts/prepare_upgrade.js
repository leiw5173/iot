const { upgrades, ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const PROXY_ADDR = process.env.EXCHANGE_CONTRACT_ADDR;

  const Exchange = await ethers.getContractFactory("Exchange");
  console.log("Preparing upgrade...");
  const exchangeV2 = await upgrades.upgradeProxy(PROXY_ADDR, Exchange);
  console.log("Exchange upgraded to:", exchangeV2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
