const mongoose = require("mongoose");

const AcademicDetailsSchema = new mongoose.Schema({
  course: {
    type: [String],
    required: true,
    default: ["Bachelor of Science in Information Technology", "Bachelor of Science in Computer Science"],
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
    default: ["University of Makati"],
  },
});

module.exports = mongoose.model("AcademicDetails", AcademicDetailsSchema);
