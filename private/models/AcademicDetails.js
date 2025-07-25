const mongoose = require("mongoose");

const AcademicDetailsSchema = new mongoose.Schema({
  course: {
    type: [String],
    required: true,
  },
  semester: {
    type: [String],
    required: true,
    default: ["1st Semester", "2nd Semester", "Trimester"],
  },
  yearLevel: {
    type: [String],
    required: true,
    default: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
  },
  school: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("AcademicDetails", AcademicDetailsSchema);
