const express = require("express");
const router = express.Router();
const {
  getScholarshipDetails,
  // Scholarship Types
  addScholarshipType,
  updateScholarshipType,
  deleteScholarshipType,
  // Scholarship Purposes
  addScholarshipPurpose,
  updateScholarshipPurpose,
  deleteScholarshipPurpose,
  // Criteria Tags
  addCriteriaTag,
  updateCriteriaTag,
  deleteCriteriaTag,
  // Documents
  addDocument,
  updateDocument,
  deleteDocument,
} = require("../controllers/scholarship-details");

// Get all scholarship details
router.get("/scholarship-details", getScholarshipDetails);

// Scholarship Types routes
router.post("/scholarship-types", addScholarshipType);
router.put("/scholarship-types", updateScholarshipType);
router.delete("/scholarship-types", deleteScholarshipType);

// Scholarship Purposes routes
router.post("/scholarship-purposes", addScholarshipPurpose);
router.put("/scholarship-purposes", updateScholarshipPurpose);
router.delete("/scholarship-purposes", deleteScholarshipPurpose);

// Criteria Tags routes
router.post("/criteria-tags", addCriteriaTag);
router.put("/criteria-tags", updateCriteriaTag);
router.delete("/criteria-tags", deleteCriteriaTag);

// Documents routes
router.post("/documents", addDocument);
router.put("/documents", updateDocument);
router.delete("/documents", deleteDocument);

module.exports = router;
