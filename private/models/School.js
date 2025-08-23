// /models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycKybVerification",
  },
  profile: {
    schoolName: String,
    schoolType: String,
    yearEstablished: Number,
  },
  courses: [
    {
      code: { type: String },
      name: { type: String },
      level: {
        type: String,
        enum: ["undergraduate", "graduate", "postgraduate"],
      },
      duration: { type: Number },
      isActive: { type: Boolean, default: true },
    },
  ],
  // students: [
  //   {
  //     studentId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Student",
  //     },
  //     enrollmentStatus: {
  //       type: String,
  //       enum: ["enrolled", "graduated", "transferred", "dropped"],
  //       default: "enrolled",
  //     },
  //     enrollmentDate: { type: Date, default: Date.now },
  //   },
  // ],
  // Add field to track authorized verifier
  activeScholarships: [
    {
      scholarshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scholarship",
      },
      sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sponsor",
      },
      selectionMode: {
        type: String,
        enum: ["auto", "manual"],
      },
      selectedStudents: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          },
          selectedAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

schoolSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("School", schoolSchema);
