const { ethers } = require("hardhat");

const networkConfig = {
  31337: {
    name: "hardhat",
  },
  11155111: {
    name: "sepolia", // Ethereum testnet (optional if you still want to use it)
  },
  80002: {
    name: "polygonAmoy", // Polygon Amoy testnet
  },
  137: {
    name: "polygon", // Polygon mainnet
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
