const ScholarshipDetails = require("../models/ScholarshipDetails");

// Get all types and purposes
exports.getScholarshipDetails = async (req, res) => {
  try {
    let details = await ScholarshipDetails.findOne();
    if (!details) {
      details = await ScholarshipDetails.create({});
    }
    res.json({ types: details.types, purposes: details.purposes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch scholarship details" });
  }
};

// Add a new type
exports.addScholarshipType = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || typeof type !== "string") {
      return res.status(400).json({ message: "Type is required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) details = await ScholarshipDetails.create({});
    if (details.types.includes(type)) {
      return res.status(409).json({ message: "Type already exists" });
    }
    details.types.push(type);
    await details.save();
    res.json({ types: details.types });
  } catch (err) {
    res.status(500).json({ message: "Failed to add type" });
  }
};

// Edit a type
exports.updateScholarshipType = async (req, res) => {
  try {
    const { oldType, newType } = req.body;
    if (!oldType || !newType) {
      return res
        .status(400)
        .json({ message: "Both oldType and newType are required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.types.indexOf(oldType);
    if (idx === -1) return res.status(404).json({ message: "Type not found" });
    details.types[idx] = newType;
    await details.save();
    res.json({ types: details.types });
  } catch (err) {
    res.status(500).json({ message: "Failed to update type" });
  }
};

// Delete a type
exports.deleteScholarshipType = async (req, res) => {
  try {
    const { type } = req.body;
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.types = details.types.filter((t) => t !== type);
    await details.save();
    res.json({ types: details.types });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete type" });
  }
};

// Add a new purpose
exports.addScholarshipPurpose = async (req, res) => {
  try {
    const { purpose } = req.body;
    if (!purpose || typeof purpose !== "string") {
      return res.status(400).json({ message: "Purpose is required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) details = await ScholarshipDetails.create({});
    if (details.purposes.includes(purpose)) {
      return res.status(409).json({ message: "Purpose already exists" });
    }
    details.purposes.push(purpose);
    await details.save();
    res.json({ purposes: details.purposes });
  } catch (err) {
    res.status(500).json({ message: "Failed to add purpose" });
  }
};

// Edit a purpose
exports.updateScholarshipPurpose = async (req, res) => {
  try {
    const { oldPurpose, newPurpose } = req.body;
    if (!oldPurpose || !newPurpose) {
      return res
        .status(400)
        .json({ message: "Both oldPurpose and newPurpose are required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.purposes.indexOf(oldPurpose);
    if (idx === -1)
      return res.status(404).json({ message: "Purpose not found" });
    details.purposes[idx] = newPurpose;
    await details.save();
    res.json({ purposes: details.purposes });
  } catch (err) {
    res.status(500).json({ message: "Failed to update purpose" });
  }
};

// Delete a purpose
exports.deleteScholarshipPurpose = async (req, res) => {
  try {
    const { purpose } = req.body;
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.purposes = details.purposes.filter((p) => p !== purpose);
    await details.save();
    res.json({ purposes: details.purposes });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete purpose" });
  }
};
