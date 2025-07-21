const mongoose = require("mongoose");

const TokenPaymentSchema = new mongoose.Schema({
  supportedTokens: {
    type: [String], // e.g., ["PHPC", "USDT", "USDC"]
    required: true,
    default: ["PHPC", "USDT", "USDC"],
  },
  paymentType: {
    type: String,
    required: true,
    enum: ["Fiat", "Crypto"], // fiat (GCash/Maya) or blockchain-based
    default: "Fiat",
  },
  merchants: {
    type: [String], // e.g., ["GCash", "Maya"] (for Fiat) or exchanges for Crypto
    default: ["GCash", "Maya"],
  },
  minimumDeposit: {
    type: Number, // in PHP or token equivalent
    required: true,
    default: 100,
  },
  maximumWithdrawal: {
    type: Number,
    required: true,
    default: 1000000,
  },
  supportedBlockchainNetworks: {
    type: [String], // e.g., ["Ethereum", "Polygon", "Ronin"]
    default: ["Ethereum", "Polygon"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TokenPayment", TokenPaymentSchema);
