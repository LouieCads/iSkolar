const TokenPayment = require("../models/TokenPayment");

// --- GET: Fetch Token and Payment Details ---
exports.getTokenPaymentDetails = async (req, res) => {
  try {
    // There should ideally be only one document for these settings
    let details = await TokenPayment.findOne();
    if (!details) {
      // If no settings exist, create a default one by letting the model use its schema defaults
      details = new TokenPayment();
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching token and payment details", error });
  }
};

// --- POST: Add a Supported Token ---
exports.addSupportedToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const details = await TokenPayment.findOne();
    if (!details.supportedTokens.includes(token)) {
      details.supportedTokens.push(token);
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error adding token", error });
  }
};

// --- PUT: Edit a Supported Token ---
exports.editSupportedToken = async (req, res) => {
  const { oldToken, newToken } = req.body;
  if (!oldToken || !newToken)
    return res.status(400).json({ message: "Old and new tokens are required" });

  try {
    const details = await TokenPayment.findOne();
    const index = details.supportedTokens.indexOf(oldToken);
    if (index > -1) {
      details.supportedTokens[index] = newToken;
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error updating token", error });
  }
};

// --- DELETE: Remove a Supported Token ---
exports.deleteSupportedToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const details = await TokenPayment.findOne();
    details.supportedTokens = details.supportedTokens.filter(
      (t) => t !== token
    );
    await details.save();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error deleting token", error });
  }
};

// --- POST: Add a Merchant ---
exports.addMerchant = async (req, res) => {
  const { merchant } = req.body;
  if (!merchant)
    return res.status(400).json({ message: "Merchant is required" });

  try {
    const details = await TokenPayment.findOne();
    if (!details.merchants.includes(merchant)) {
      details.merchants.push(merchant);
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error adding merchant", error });
  }
};

// --- PUT: Edit a Merchant ---
exports.editMerchant = async (req, res) => {
  const { oldMerchant, newMerchant } = req.body;
  if (!oldMerchant || !newMerchant)
    return res
      .status(400)
      .json({ message: "Old and new merchants are required" });

  try {
    const details = await TokenPayment.findOne();
    const index = details.merchants.indexOf(oldMerchant);
    if (index > -1) {
      details.merchants[index] = newMerchant;
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error updating merchant", error });
  }
};

// --- DELETE: Remove a Merchant ---
exports.deleteMerchant = async (req, res) => {
  const { merchant } = req.body;
  if (!merchant)
    return res.status(400).json({ message: "Merchant is required" });

  try {
    const details = await TokenPayment.findOne();
    details.merchants = details.merchants.filter((m) => m !== merchant);
    await details.save();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error deleting merchant", error });
  }
};

// --- POST: Add a Supported Blockchain Network ---
exports.addBlockchainNetwork = async (req, res) => {
  const { network } = req.body;
  if (!network) return res.status(400).json({ message: "Network is required" });

  try {
    const details = await TokenPayment.findOne();
    if (!details.supportedBlockchainNetworks.includes(network)) {
      details.supportedBlockchainNetworks.push(network);
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error adding network", error });
  }
};

// --- PUT: Edit a Supported Blockchain Network ---
exports.editBlockchainNetwork = async (req, res) => {
  const { oldNetwork, newNetwork } = req.body;
  if (!oldNetwork || !newNetwork)
    return res
      .status(400)
      .json({ message: "Old and new networks are required" });

  try {
    const details = await TokenPayment.findOne();
    const index = details.supportedBlockchainNetworks.indexOf(oldNetwork);
    if (index > -1) {
      details.supportedBlockchainNetworks[index] = newNetwork;
      await details.save();
    }
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error updating network", error });
  }
};

// --- DELETE: Remove a Supported Blockchain Network ---
exports.deleteBlockchainNetwork = async (req, res) => {
  const { network } = req.body;
  if (!network) return res.status(400).json({ message: "Network is required" });

  try {
    const details = await TokenPayment.findOne();
    details.supportedBlockchainNetworks =
      details.supportedBlockchainNetworks.filter((n) => n !== network);
    await details.save();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error deleting network", error });
  }
};

// --- PUT: Update General Settings ---
exports.updateGeneralSettings = async (req, res) => {
  try {
    const { minimumDeposit, maximumWithdrawal } = req.body;
    const details = await TokenPayment.findOne();

    if (minimumDeposit !== undefined) details.minimumDeposit = minimumDeposit;
    if (maximumWithdrawal !== undefined)
      details.maximumWithdrawal = maximumWithdrawal;

    await details.save();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: "Error updating general settings", error });
  }
};
