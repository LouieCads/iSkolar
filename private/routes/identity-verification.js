// routes/identity-verification.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/auth");

// Import controller functions
const {
  getKycStatus,
  submitStudentIdentityVerification,
  submitIndividualSponsorIdentityVerification,
  submitCorporateSponsorIdentityVerification,
  submitSchoolKyb,
  getVerificationById,
  getAllVerifications,
  updateVerificationStatus,
  uploadDocument,
  deleteDocument,
  getVerificationHistory,
  resubmitVerification,
  bulkUpdateStatus,
  getVerificationStats,
} = require("../controllers/identity-verification");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/documents/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images, PDFs, and documents are allowed"));
    }
  },
});

// Public routes (with auth)
router.get("/status", authMiddleware, getKycStatus);
router.get("/history", authMiddleware, getVerificationHistory);

// Identity submission routes (all go directly to admin)
router.post(
  "/student/submit",
  authMiddleware,
  submitStudentIdentityVerification
);
router.post(
  "/individual-sponsor/submit",
  authMiddleware,
  submitIndividualSponsorIdentityVerification
);
router.post(
  "/corporate-sponsor/submit",
  authMiddleware,
  submitCorporateSponsorIdentityVerification
);
router.post("/school/submit", authMiddleware, submitSchoolIdentityVerification);

// Document management routes
router.post("/upload-document", authMiddleware, upload.single("document"), uploadDocument);
router.delete("/document/:documentId", authMiddleware, deleteDocument);

// Resubmission route
router.post("/resubmit", authMiddleware, resubmitVerification);

// Admin-only routes for verification management
router.get("/all", authMiddleware, getAllVerifications);
router.get("/stats", authMiddleware, getVerificationStats);
router.get("/:verificationId", authMiddleware, getVerificationById);
router.put("/:verificationId/status", authMiddleware, updateVerificationStatus);
router.post("/bulk-update", authMiddleware, bulkUpdateStatus);

module.exports = router;