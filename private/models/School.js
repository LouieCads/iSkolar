// School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
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
  paymentMethods: {
    gcash: {
      number: { type: String },
      accountName: { type: String },
      isActive: { type: Boolean, default: false },
    },
    maya: {
      number: { type: String },
      accountName: { type: String },
      isActive: { type: Boolean, default: false },
    },
    crypto: {
      phpc: { type: String },
      usdt: { type: String },
      usdc: { type: String },
    },
  },
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
  kycReviewQueue: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      submittedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["pending", "pre_approved", "denied"],
        default: "pending",
      },
      reviewedAt: { type: Date },
      reviewerNotes: { type: String },
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
