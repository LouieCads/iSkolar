const express = require("express");
const router = express.Router();
const { updatePlatform, getPlatformName } = require("../controllers/platform");
const authMiddleware = require("../middleware/auth");

router.put("/change-name", updatePlatform);
router.get("/name", getPlatformName);

module.exports = router;
