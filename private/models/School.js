// /models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  // School identification fields
  schoolName: {
    type: String,
    unique: true,
    trim: true,
  },
  schoolType: {
    type: String,
  },
  // Remove verificationStatus - will use KycKybVerification instead
  // Add KYC reference
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycKybVerification",
  },
  // Add KYC review queue for student submissions
  kycReviewQueue: [
    {
      verificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KycKybVerification",
      },
      studentName: String,
      schoolName: String,
      submittedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["pending", "pre_approved", "denied"],
        default: "pending",
      },
      reviewedAt: Date,
      reviewedBy: String,
      reviewerNotes: String,
    },
  ],
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
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      enrollmentStatus: {
        type: String,
        enum: ["enrolled", "graduated", "transferred", "dropped"],
        default: "enrolled",
      },
      enrollmentDate: { type: Date, default: Date.now },
    },
  ],
  // Add field to track authorized verifiers
  verifiers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      email: String,
      addedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    },
  ],
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
