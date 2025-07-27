const express = require("express");
const router = express.Router();
const { getKycStatus } = require("../controllers/kyc-kyb-verification");

router.get("/status", getKycStatus);

module.exports = router;
