const mongoose = require("mongoose");

const AcademicDetailsSchema = new mongoose.Schema({
  course: {
    type: [String],
    required: true,
    default: ["BSCS", "BSIT"],
  },
  yearLevel: {
    type: [String],
    required: true,
    default: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  },
  school: {
    type: [String],
    required: true,
    default: ["University of Makati"],
  },
});

module.exports = mongoose.model("AcademicDetails", AcademicDetailsSchema);
