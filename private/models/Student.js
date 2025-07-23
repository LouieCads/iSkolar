const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  nationality: {
    type: String,
    default: "Filipino",
  },

  // Contact Information
  phoneNumber: {
    type: String,
  },
  address: {
    street: { type: String },
    city: { type: String },
    province: { type: String },
    zipCode: { type: String },
  },

  // Academic Information
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
  },
  course: {
    type: String,
  },
  yearLevel: {
    type: String,
    enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
  },
  studentId: {
    type: String,
  },
  gwa: {
    type: Number,
    min: 1.0,
    max: 5.0,
  },

  // Documents
  documents: [
    {
      type: {
        type: String,
        enum: ["cor", "report_card"],
      },
      fileName: { type: String },
      fileUrl: { type: String },
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
    },
  ],

  // Scholarship Applications
  scholarshipApplications: [
    {
      scholarshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scholarship",
      },
      status: {
        type: String,
        enum: ["pending", "approved", "denied", "withdrawn"],
        default: "pending",
      },
      appliedAt: { type: Date, default: Date.now },
      documents: [
        {
          type: String,
          fileName: String,
          fileUrl: String,
        },
      ],
      essay: String,
    },
  ],

  // System fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  kycStatus: {
    type: String,
    enum: ["unverified", "pending", "pre_approved", "approved", "denied"],
    default: "unverified",
  },
});

// Update the updatedAt field before saving
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Student", studentSchema);
