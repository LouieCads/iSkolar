const express = require("express");
const {
  upload,
  createScholarship,
  getScholarships,
  getScholarship,
  updateScholarship,
  deleteScholarship,
  getAllScholarshipBanners,
  getScholarshipBannerDetails,
} = require("../controllers/scholarships");
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

// **PUBLIC FEED ROUTES** - These should come BEFORE the sponsor middleware
/**
 * @route   GET /scholarship-banner/feed
 * @desc    Get all active scholarship banners for feed display
 * @access  Private (Both students and sponsors can access)
 * @query   page, limit, scholarshipType, purpose, search, school, sortBy, sortOrder
 */
router.get("/feed", getAllScholarshipBanners);

/**
 * @route   GET /scholarship-banner/feed/:id
 * @desc    Get detailed information about a specific scholarship banner
 * @access  Private (Both students and sponsors can access)
 */
router.get("/feed/:id", getScholarshipBannerDetails);

// **SPONSOR-ONLY ROUTES** - Apply sponsor role check to these routes
/**
 * @route   POST /scholarship-banner/create
 * @desc    Create a new scholarship
 * @access  Private (Sponsor only)
 * @body    title, description (optional), scholarshipType, purpose, totalScholars,
 *          amountPerScholar, selectedSchool, selectionMode, applicationDeadline,
 *          criteriaTags, requiredDocuments
 * @file    bannerImage (optional)
 */
router.post(
  "/create",
  checkSponsorRole,
  upload.single("bannerImage"),
  createScholarship
);

/**
 * @route   GET /scholarship-banner
 * @desc    Get all scholarships for the authenticated sponsor
 * @access  Private (Sponsor only)
 * @query   page, limit, status, scholarshipType, purpose, search
 */
router.get("/", checkSponsorRole, getScholarships);

/**
 * @route   GET /scholarship-banner/:id
 * @desc    Get a single scholarship by ID
 * @access  Private (Sponsor only)
 */
router.get("/:id", checkSponsorRole, getScholarship);

/**
 * @route   PUT /scholarship-banner/:id
 * @desc    Update a scholarship
 * @access  Private (Sponsor only)
 * @body    Any scholarship fields to update
 * @file    bannerImage (optional)
 */
router.put(
  "/:id",
  checkSponsorRole,
  upload.single("bannerImage"),
  updateScholarship
);

/**
 * @route   DELETE /scholarship-banner/:id
 * @desc    Delete a scholarship
 * @access  Private (Sponsor only)
 */
router.delete("/:id", checkSponsorRole, deleteScholarship);

module.exports = router;
