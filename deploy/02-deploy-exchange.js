// Deploy Exchange contract

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Exchange", {
    from: deployer,
    args: ["0x5fbdb2315678afecb367f032d93f642f64180aa3"],
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["Exchange", "all"];
