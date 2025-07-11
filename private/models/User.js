const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "sponsor", "school", "admin"],
  },
  // Reference to specific persona model
  personaId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "personaModel",
  },
  personaModel: {
    type: String,
    enum: ["Student", "Sponsor", "School", "Admin"],
  },
  hasSelectedRole: {
    type: Boolean,
    default: false, // Track if user has completed role selection
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSuspended: {
    type: Boolean,
    default: false,
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
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
