const { ethers, deployments, getNamedAccounts } = require("hardhat");

module.exports = async function () {
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Setting up test environment...");

  // Get the deployed contract instance properly
  const credentialRegistryDeployment = await deployments.get(
    "CredentialRegistry"
  );
  const credentialRegistry = await ethers.getContractAt(
    "CredentialRegistry",
    credentialRegistryDeployment.address
  );

  // Get test accounts for schools
  const accounts = await ethers.getSigners();
  const school1 = accounts[1];
  const school2 = accounts[2];

  log("Adding test schools as issuers...");

  try {
    // Add schools as issuers
    const addSchool1Tx = await credentialRegistry.addIssuer(school1.address);
    await addSchool1Tx.wait(1);
    log(`School 1 (${school1.address}) added as issuer`);

    const addSchool2Tx = await credentialRegistry.addIssuer(school2.address);
    await addSchool2Tx.wait(1);
    log(`School 2 (${school2.address}) added as issuer`);

    // Verify schools have issuer role
    const isSchool1Issuer = await credentialRegistry.isIssuer(school1.address);
    const isSchool2Issuer = await credentialRegistry.isIssuer(school2.address);

    log(`School 1 is issuer: ${isSchool1Issuer}`);
    log(`School 2 is issuer: ${isSchool2Issuer}`);

    log("Test environment setup complete!");
  } catch (error) {
    log("Error during test environment setup:", error.message);
    throw error;
  }

  log("----------------------------------------------------");
};

module.exports.tags = ["all", "setup"];
module.exports.dependencies = ["credential-registry"];
