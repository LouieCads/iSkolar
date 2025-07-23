const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  // School Information
  schoolName: {
    type: String,
    trim: true,
  },
  schoolCode: {
    type: String,
    unique: true,
  },
  schoolType: {
    type: String,
    enum: ["university", "college", "institute", "technical_school"],
  },
  accreditation: {
    type: String,
    enum: ["CHED", "TESDA", "PACUCOA", "AACCUP", "other"],
  },

  // Contact Information
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  address: {
    street: { type: String },
    city: { type: String },
    province: { type: String },
    zipCode: { type: String },
  },

  // Administrative Information
  president: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  registrar: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },

  // Academic Programs
  courses: [
    {
      code: { type: String },
      name: { type: String },
      level: {
        type: String,
        enum: ["undergraduate", "graduate", "postgraduate"],
      },
      duration: { type: Number }, // in years
      isActive: { type: Boolean, default: true },
    },
  ],

  // Payment Information
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

  // Documents
  documents: [
    {
      type: {
        type: String,
        enum: [
          "business_permit",
          "accreditation_certificate",
          "tax_certificate",
          "bank_statement",
        ],
      },
      fileName: { type: String },
      fileUrl: { type: String },
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
    },
  ],

  // Student Management
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

  // KYC Review Queue
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

  // Scholarship Management
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
    enum: ["unverified", "pending", "approved", "denied"],
    default: "unverified",
  },
});

// Update the updatedAt field before saving
schoolSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("School", schoolSchema);
