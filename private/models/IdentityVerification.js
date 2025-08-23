// /models/IdentityVerification.js
const mongoose = require("mongoose");

const IdentityVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  personaType: {
    type: String,
    enum: ["student", "sponsor", "school"],
    required: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["unverified", "pending", "verified", "denied"],
    default: "unverified",
  },
  resubmissionCount: {
    type: Number,
    default: 0,
    max: 2,
  },
  cooldownUntil: {
    type: Date,
  },
  declarationsAndConsent: {
    type: Boolean,
    required: true,
  },
  verifiedBy: {
    type: String, // Email of Admin
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
  denialReason: {
    type: String,
  },

  proofOfIdentity: {
    fullName: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
    dateOfBirth: Date,
    nationality: String,
    contactEmail: String,
    contactNumber: String,
    address: {
      country: String,
      stateOrProvince: String,
      city: String,
      districtOrBarangay: String,
      street: String,
      postalCode: String,
    },
    idDetails: {
      idType: String, // e.g., Passport, National ID, Driver's License
      frontImageUrl: String, // front side of the ID
      backImageUrl: String, // back side of the ID
      idNumber: String,
      expiryDate: Date,
    },
    selfiePhotoUrl: String, // selfie for liveness + ID face match
  },

  // System fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
IdentityVerificationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (
    this.isModified("status") &&
    this.status === "denied" &&
    this.resubmissionCount >= 2
  ) {
    this.cooldownUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days cooldown
  }
  next();
});

module.exports = mongoose.model(
  "IdentityVerification",
  IdentityVerificationSchema
);