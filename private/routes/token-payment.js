const express = require("express");
const router = express.Router();
const {
  getTokenPaymentDetails,
  addSupportedToken,
  editSupportedToken,
  deleteSupportedToken,
  addMerchant,
  editMerchant,
  deleteMerchant,
  addBlockchainNetwork,
  editBlockchainNetwork,
  deleteBlockchainNetwork,
  updateGeneralSettings,
} = require("../controllers/token-payment");

// --- GET ---
router.get("/token-payment-details", getTokenPaymentDetails);

// --- POST ---
router.post("/supported-tokens", addSupportedToken);
router.post("/merchants", addMerchant);
router.post("/blockchain-networks", addBlockchainNetwork);

// --- PUT ---
router.put("/supported-tokens", editSupportedToken);
router.put("/merchants", editMerchant);
router.put("/blockchain-networks", editBlockchainNetwork);
router.put("/general-settings", updateGeneralSettings);

// --- DELETE ---
router.delete("/supported-tokens", deleteSupportedToken);
router.delete("/merchants", deleteMerchant);
router.delete("/blockchain-networks", deleteBlockchainNetwork);

module.exports = router;
