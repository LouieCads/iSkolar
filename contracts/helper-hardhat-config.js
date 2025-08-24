const { ethers } = require("hardhat");

const networkConfig = {
  31337: {
    name: "hardhat",
    blockConfirmations: 1,
  },
  11155111: {
    name: "sepolia", // Ethereum testnet
    blockConfirmations: 6,
  },
  80002: {
    name: "polygonAmoy", // Polygon Amoy testnet
    blockConfirmations: 6,
  },
  137: {
    name: "polygon", // Polygon mainnet
    blockConfirmations: 6,
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
