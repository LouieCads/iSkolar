const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  bannerUrl: {
    type: String,
    trim: true,
  },
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false, // Made optional since it can be empty
  },

  // Sponsor Information
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sponsor",
    required: true,
  },

  // Scholarship Details
  scholarshipType: {
    type: String,
    enum: ["merit_based", "skill_based"],
    required: true,
  },
  purpose: {
    type: String,
    enum: ["tuition", "allowance"],
    required: true,
  },

  // Requirements
  criteriaTags: [
    {
      type: String,
      trim: true,
    },
  ],
  requiredDocuments: [
    {
      type: String,
      enum: [
        "id_card",
        "birth_certificate",
        "academic_records",
        "certificates",
        "awards",
        "essay",
      ],
    },
  ],

  // Financial Details
  totalScholars: {
    type: Number,
    required: true,
    min: 1,
  },
  amountPerScholar: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: false, // Will be calculated automatically
    min: 0,
  },

  // School and Selection
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: false, // Made optional since we'll generate it
  },
  selectedSchool: {
    type: String,
    required: true,
  },
  selectionMode: {
    type: String,
    enum: ["auto", "manual"],
    required: true,
  },

  // Timeline
  applicationDeadline: {
    type: Date,
    required: true,
  },
  selectionDeadline: {
    type: Date,
  },

  // Status
  status: {
    type: String,
    enum: ["draft", "active", "closed", "archived"],
    default: "draft",
  },

  // Applications
  applications: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
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
      selectedAt: Date,
      selectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "selectedByModel",
      },
      selectedByModel: {
        type: String,
        enum: ["School", "Sponsor"],
      },
    },
  ],

  // Selected Scholars
  selectedScholars: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      selectedAt: { type: Date, default: Date.now },
      selectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "selectedByModel",
      },
      selectedByModel: {
        type: String,
        enum: ["School", "Sponsor"],
      },
      amount: { type: Number, required: true },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        enum: ["gcash", "maya", "crypto"],
      },
      paymentDate: Date,
      paymentConfirmation: String,
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
});

// Calculate total amount before saving
scholarshipSchema.pre("save", function (next) {
  this.totalAmount = this.totalScholars * this.amountPerScholar;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
