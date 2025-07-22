const express = require("express");
const router = express.Router();
const {
  updatePlatform,
  getPlatformName,
  uploadLogo,
} = require("../controllers/platform");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

router.put("/change-name", updatePlatform);
router.get("/name", getPlatformName);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/public"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.post("/upload-logo", upload.single("logo"), uploadLogo);

module.exports = router;
