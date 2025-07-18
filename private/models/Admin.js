const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  // Administrative Information
  adminLevel: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
  permissions: [
    {
      type: String,
      enum: [
        "manage_users",
        "manage_kyc",
        "manage_scholarships",
        "manage_schools",
        "manage_sponsors",
        "manage_settings",
        "view_reports",
        "manage_admins",
      ],
    },
  ],

  // Activity Log (for audit trail)
  activityLog: [
    {
      action: { type: String, required: true },
      target: { type: String }, // user, scholarship, etc.
      targetId: { type: mongoose.Schema.Types.ObjectId },
      details: { type: String },
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String },
    },
  ],

  // System fields
  lastLoginAt: {
    type: Date,
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
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
