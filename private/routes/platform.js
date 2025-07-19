const express = require("express");
const router = express.Router();
const {
  updatePlatform,
  getPlatformName,
  getScholarshipDetails,
  addScholarshipType,
  updateScholarshipType,
  deleteScholarshipType,
  addScholarshipPurpose,
  updateScholarshipPurpose,
  deleteScholarshipPurpose,
} = require("../controllers/platform");
const authMiddleware = require("../middleware/auth");

router.put("/change-name", updatePlatform);
router.get("/name", getPlatformName);

// Scholarship Types & Purposes CRUD
router.get("/scholarship-details", getScholarshipDetails);
router.post("/scholarship-types", addScholarshipType);
router.put("/scholarship-types", updateScholarshipType);
router.delete("/scholarship-types", deleteScholarshipType);
router.post("/scholarship-purposes", addScholarshipPurpose);
router.put("/scholarship-purposes", updateScholarshipPurpose);
router.delete("/scholarship-purposes", deleteScholarshipPurpose);

module.exports = router;
