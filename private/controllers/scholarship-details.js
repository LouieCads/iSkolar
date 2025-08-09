const ScholarshipDetails = require("../models/ScholarshipDetails");

// Get all types, purposes, criteriaTags, and documents
exports.getScholarshipDetails = async (req, res) => {
  try {
    let details = await ScholarshipDetails.findOne();
    if (!details) {
      details = await ScholarshipDetails.create({
        criteriaTags: [
          "Academic Excellence",
          "Financial Need",
          "Community Service",
        ],
        documents: [
          "Transcript of Records",
          "Certificate of Enrollment",
          "Valid ID",
        ],
      });
    }
    res.json({
      types: details.types,
      purposes: details.purposes,
      criteriaTags: details.criteriaTags,
      documents: details.documents,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch scholarship details" });
  }
};

// ================= SCHOLARSHIP TYPES =================

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

// ================= SCHOLARSHIP PURPOSES =================

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

// ================= CRITERIA TAGS =================

// Add a new criteria tag
exports.addCriteriaTag = async (req, res) => {
  try {
    const { criteriaTag } = req.body;
    if (!criteriaTag || typeof criteriaTag !== "string") {
      return res.status(400).json({ message: "Criteria tag is required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) details = await ScholarshipDetails.create({});
    if (details.criteriaTags.includes(criteriaTag)) {
      return res.status(409).json({ message: "Criteria tag already exists" });
    }
    details.criteriaTags.push(criteriaTag);
    await details.save();
    res.json({ criteriaTags: details.criteriaTags });
  } catch (err) {
    res.status(500).json({ message: "Failed to add criteria tag" });
  }
};

// Edit a criteria tag
exports.updateCriteriaTag = async (req, res) => {
  try {
    const { oldCriteriaTag, newCriteriaTag } = req.body;
    if (!oldCriteriaTag || !newCriteriaTag) {
      return res
        .status(400)
        .json({
          message: "Both oldCriteriaTag and newCriteriaTag are required",
        });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.criteriaTags.indexOf(oldCriteriaTag);
    if (idx === -1)
      return res.status(404).json({ message: "Criteria tag not found" });
    details.criteriaTags[idx] = newCriteriaTag;
    await details.save();
    res.json({ criteriaTags: details.criteriaTags });
  } catch (err) {
    res.status(500).json({ message: "Failed to update criteria tag" });
  }
};

// Delete a criteria tag
exports.deleteCriteriaTag = async (req, res) => {
  try {
    const { criteriaTag } = req.body;
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.criteriaTags = details.criteriaTags.filter(
      (c) => c !== criteriaTag
    );
    await details.save();
    res.json({ criteriaTags: details.criteriaTags });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete criteria tag" });
  }
};

// ================= DOCUMENTS =================

// Add a new document
exports.addDocument = async (req, res) => {
  try {
    const { document } = req.body;
    if (!document || typeof document !== "string") {
      return res.status(400).json({ message: "Document is required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) details = await ScholarshipDetails.create({});
    if (details.documents.includes(document)) {
      return res.status(409).json({ message: "Document already exists" });
    }
    details.documents.push(document);
    await details.save();
    res.json({ documents: details.documents });
  } catch (err) {
    res.status(500).json({ message: "Failed to add document" });
  }
};

// Edit a document
exports.updateDocument = async (req, res) => {
  try {
    const { oldDocument, newDocument } = req.body;
    if (!oldDocument || !newDocument) {
      return res
        .status(400)
        .json({ message: "Both oldDocument and newDocument are required" });
    }
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.documents.indexOf(oldDocument);
    if (idx === -1)
      return res.status(404).json({ message: "Document not found" });
    details.documents[idx] = newDocument;
    await details.save();
    res.json({ documents: details.documents });
  } catch (err) {
    res.status(500).json({ message: "Failed to update document" });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { document } = req.body;
    let details = await ScholarshipDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.documents = details.documents.filter((d) => d !== document);
    await details.save();
    res.json({ documents: details.documents });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete document" });
  }
};
