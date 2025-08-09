const mongoose = require("mongoose");

const ScholarshipDetailsSchema = new mongoose.Schema({
  types: {
    type: [String],
    required: true,
    default: ["Merit-based", "Skill-based"],
  },
  purposes: {
    type: [String],
    required: true,
    default: ["Tuition", "Allowance"],
  },
  criteriaTags: {
    type: [String],
    default: ["Academic Excellence", "Financial Need", "Community Service"],
  },
  documents: {
    type: [String],
    default: ["Transcript of Records", "Certificate of Enrollment", "Valid ID"],
  },
});

module.exports = mongoose.model("ScholarshipDetails", ScholarshipDetailsSchema);
