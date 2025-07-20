const Credentials = require("../models/Credentials");

// Get all credentials settings
exports.getCredentials = async (req, res) => {
  try {
    let creds = await Credentials.findOne();
    if (!creds) {
      creds = await Credentials.create({});
    }
    res.json({ documentType: creds.documentType, fileSize: creds.fileSize });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch credentials settings" });
  }
};

// Add a new document type
exports.addDocumentType = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || typeof type !== "string") {
      return res.status(400).json({ message: "Type is required" });
    }
    let creds = await Credentials.findOne();
    if (!creds) creds = await Credentials.create({});
    if (creds.documentType.includes(type)) {
      return res.status(409).json({ message: "Type already exists" });
    }
    creds.documentType.push(type);
    await creds.save();
    res.json({ documentType: creds.documentType });
  } catch (err) {
    res.status(500).json({ message: "Failed to add document type" });
  }
};

// Edit a document type
exports.updateDocumentType = async (req, res) => {
  try {
    const { oldType, newType } = req.body;
    if (!oldType || !newType) {
      return res
        .status(400)
        .json({ message: "Both oldType and newType are required" });
    }
    let creds = await Credentials.findOne();
    if (!creds)
      return res.status(404).json({ message: "Credentials not found" });
    const idx = creds.documentType.indexOf(oldType);
    if (idx === -1) return res.status(404).json({ message: "Type not found" });
    creds.documentType[idx] = newType;
    await creds.save();
    res.json({ documentType: creds.documentType });
  } catch (err) {
    res.status(500).json({ message: "Failed to update document type" });
  }
};

// Delete a document type
exports.deleteDocumentType = async (req, res) => {
  try {
    const { type } = req.body;
    let creds = await Credentials.findOne();
    if (!creds)
      return res.status(404).json({ message: "Credentials not found" });
    creds.documentType = creds.documentType.filter((t) => t !== type);
    await creds.save();
    res.json({ documentType: creds.documentType });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete document type" });
  }
};

// Update file size
exports.updateFileSize = async (req, res) => {
  try {
    const { fileSize } = req.body;
    if (typeof fileSize !== "number" || fileSize <= 0) {
      return res
        .status(400)
        .json({ message: "fileSize must be a positive number" });
    }
    let creds = await Credentials.findOne();
    if (!creds) creds = await Credentials.create({});
    creds.fileSize = fileSize;
    await creds.save();
    res.json({ fileSize: creds.fileSize });
  } catch (err) {
    res.status(500).json({ message: "Failed to update file size" });
  }
};
