const express = require("express");
const {
  upload,
  createScholarship,
  getScholarships,
  getScholarship,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarship-banner");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Middleware to check if user is a sponsor
const checkSponsorRole = (req, res, next) => {
  if (req.user.role !== "sponsor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Sponsor role required.",
    });
  }
  next();
};

// Apply sponsor role check to all routes
router.use(checkSponsorRole);

/**
 * @route   POST /scholarship-banner/create
 * @desc    Create a new scholarship
 * @access  Private (Sponsor only)
 * @body    title, description (optional), scholarshipType, purpose, totalScholars,
 *          amountPerScholar, selectedSchool, selectionMode, applicationDeadline,
 *          criteriaTags, requiredDocuments
 * @file    bannerImage (optional)
 */
router.post("/create", upload.single("bannerImage"), createScholarship);

/**
 * @route   GET /scholarship-banner
 * @desc    Get all scholarships for the authenticated sponsor
 * @access  Private (Sponsor only)
 * @query   page, limit, status, scholarshipType, purpose, search
 */
router.get("/", getScholarships);

/**
 * @route   GET /scholarship-banner/:id
 * @desc    Get a single scholarship by ID
 * @access  Private (Sponsor only)
 */
router.get("/:id", getScholarship);

/**
 * @route   PUT /scholarship-banner/:id
 * @desc    Update a scholarship
 * @access  Private (Sponsor only)
 * @body    Any scholarship fields to update
 * @file    bannerImage (optional)
 */
router.put("/:id", upload.single("bannerImage"), updateScholarship);

/**
 * @route   DELETE /scholarship-banner/:id
 * @desc    Delete a scholarship
 * @access  Private (Sponsor only)
 */
router.delete("/:id", deleteScholarship);

module.exports = router;
