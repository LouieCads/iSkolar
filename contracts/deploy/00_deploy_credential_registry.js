const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

module.exports = async function () {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  log("----------------------------------------------------");
  log("Deploying CredentialRegistry...");

  const credentialRegistry = await deploy("CredentialRegistry", {
    from: deployer,
    args: [deployer], // deployer becomes the admin
    log: true,
    waitConfirmations: networkConfig[chainId]?.blockConfirmations || 1,
  });

  log(`CredentialRegistry deployed at: ${credentialRegistry.address}`);
  log("----------------------------------------------------");
};

module.exports.tags = ["all", "credential-registry"];
