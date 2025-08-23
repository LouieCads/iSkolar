require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY1, process.env.PRIVATE_KEY2].filter(
        Boolean
      ),
      chainId: 11155111,
      blockConfirmations: 6,
    },
    polygon_amoy: {
      url: process.env.AMOY_RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY1, process.env.PRIVATE_KEY2].filter(
        Boolean
      ),
      chainId: 80002, // Polygon Amoy Testnet
    },
    polygon_mainnet: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: [process.env.PRIVATE_KEY1, process.env.PRIVATE_KEY2].filter(
        Boolean
      ),
      chainId: 137,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },
};
