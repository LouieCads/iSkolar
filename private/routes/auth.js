const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  selectRole,
  checkRoleSelection,
} = require("../controllers/auth");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/select-role", authMiddleware, selectRole);
router.get("/check-role-selection", authMiddleware, checkRoleSelection);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
