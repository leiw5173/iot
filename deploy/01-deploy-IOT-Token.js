// SPDX-License-Identifier: MIT

// Deploy IOT Token

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deploying IOT Token with account:", deployer);
  const iotToken = await deploy("Currency", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  if (iotToken.newlyDeployed) {
    console.log("IOT Token deployed to:", iotToken.address);
  }
};

module.exports.tags = ["Currency", "all"];
