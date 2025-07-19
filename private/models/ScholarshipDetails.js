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
  // criteriaTags: {
  //   type: [String],
  //   default: [],
  // },
});

module.exports = mongoose.model("ScholarshipDetails", ScholarshipDetailsSchema);
