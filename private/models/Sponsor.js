const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema({
  // Sponsor Type
  sponsorType: {
    type: String,
    enum: ["individual", "corporate"],
      },

  // Personal Information (for Individual Sponsors)
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
    enum: ["male", "female", "other"],
  },
  nationality: {
    type: String,
    default: "Filipino",
  },

  // Corporate Information (for Corporate Sponsors)
  companyName: {
    type: String,
    trim: true,
  },
  businessRegistrationNumber: {
    type: String,
  },
  industrySector: {
    type: String,
  },
  organizationType: {
    type: String,
    enum: [
      "corporation",
      "partnership",
      "sole_proprietorship",
      "non_profit",
      "government",
    ],
  },

  // Contact Information
  phoneNumber: {
    type: String,
  },
  address: {
    street: { type: String,},
    city: { type: String, },
    province: { type: String,  },
    zipCode: { type: String, },
  },

  // Financial Information
  sourceOfIncome: {
    type: String,
  },
  natureOfWork: {
    type: String,
  },
  annualIncome: {
    type: Number,
  },

  // KYC/KYB Status
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "denied"],
    default: "pending",
  },
  verificationSubmittedAt: {
    type: Date,
  },
  verificationApprovedAt: {
    type: Date,
  },
  verificationDeniedAt: {
    type: Date,
  },
  verificationDenialReason: {
    type: String,
  },
  verificationSubmissionCount: {
    type: Number,
    default: 0,
  },

  // Documents
  documents: [
    {
      type: {
        type: String,
        enum: [
          "id_card",
          "birth_certificate",
          "business_permit",
          "tax_certificate",
          "financial_statement",
        ],
      },
      fileName: { type: String,  },
      fileUrl: { type: String,  },
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
    },
  ],

  // Wallet Information
  walletBalance: {
    phpc: { type: Number, default: 0 },
    usdt: { type: Number, default: 0 },
    usdc: { type: Number, default: 0 },
  },

  // Scholarship Programs
  scholarshipPrograms: [
    {
      title: { type: String, },
      description: { type: String,  },
      scholarshipType: {
        type: String,
        enum: ["merit_based", "skill_based"],
        
      },
      purpose: {
        type: String,
        enum: ["tuition", "allowance"],
      },
      totalScholars: { type: Number,  },
      amountPerScholar: { type: Number,  },
      applicationDeadline: { type: Date,  },
      schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
     },
      selectionMode: {
        type: String,
        enum: ["auto", "manual"],
      },
      status: {
        type: String,
        enum: ["draft", "active", "closed", "archived"],
        default: "draft",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // System fields
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
sponsorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Sponsor", sponsorSchema);
