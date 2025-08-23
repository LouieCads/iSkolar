// Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycKybVerification",
  },
  profile: {
    username: String,
    gender: String,
    age: Number,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Student", studentSchema);
