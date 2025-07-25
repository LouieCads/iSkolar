const mongoose = require("mongoose");

const PERSONA_TYPES = ["student", "sponsor", "school", "admin"];

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
    enum: PERSONA_TYPES,
  },
  // Reference to specific persona model (Student, Sponsor, School, Admin)
  personaId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "personaModel",
  },
  personaModel: {
    type: String,
    enum: PERSONA_TYPES.map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1)
    ), 
  },
  kycId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "KycKybVerification",
  },
  hasSelectedRole: {
    type: Boolean,
    default: false, // Track if user has completed role selection
  },
  status: {
    type: String,
    enum: ["active", "suspended", "inactive"],
    default: "active",
  },
  isVerified: {
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

// Helper to delete persona by model and id
async function deletePersona(model, id) {
  if (!model || !id) return;
  try {
    const mongoose = require("mongoose");
    switch (model.toLowerCase()) {
      case "student":
        await mongoose.model("Student").findByIdAndDelete(id);
        break;
      case "sponsor":
        await mongoose.model("Sponsor").findByIdAndDelete(id);
        break;
      case "school":
        await mongoose.model("School").findByIdAndDelete(id);
        break;
      case "admin":
        await mongoose.model("Admin").findByIdAndDelete(id);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`Failed to cascade delete persona (${model}):`, err);
  }
}

// Cascade delete persona and KYC after user is deleted
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    if (doc.personaModel && doc.personaId) {
      await deletePersona(doc.personaModel, doc.personaId);
    }
    if (doc.kycId) {
      await mongoose.model("KycKybVerification").findByIdAndDelete(doc.kycId);
    }
  }
});

module.exports = mongoose.model("User", userSchema);
