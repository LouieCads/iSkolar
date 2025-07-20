const express = require("express");
const router = express.Router();
const {
  getCredentials,
  addDocumentType,
  updateDocumentType,
  deleteDocumentType,
  updateFileSize,
} = require("../controllers/credentials");

router.get("/", getCredentials);
router.post("/types", addDocumentType);
router.put("/types", updateDocumentType);
router.delete("/types", deleteDocumentType);
router.put("/file-size", updateFileSize);

module.exports = router;
