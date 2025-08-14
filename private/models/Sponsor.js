// Sponsor.js
const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema({
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycKybVerification",
  },
  subRole: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
  },
  walletBalance: {
    phpc: { type: Number, default: 0 },
    usdt: { type: Number, default: 0 },
    usdc: { type: Number, default: 0 },
  },
  scholarshipPrograms: [
    {
      title: { type: String },
      description: { type: String },
      scholarshipType: {
        type: String,
        enum: ["merit_based", "skill_based"],
      },
      purpose: {
        type: String,
        enum: ["tuition", "allowance"],
      },
      totalScholars: { type: Number },
      amountPerScholar: { type: Number },
      applicationDeadline: { type: Date },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

sponsorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Sponsor", sponsorSchema);
