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
    switch (model) {
      case "Student":
        await mongoose.model("Student").findByIdAndDelete(id);
        break;
      case "Sponsor":
        await mongoose.model("Sponsor").findByIdAndDelete(id);
        break;
      case "School":
        await mongoose.model("School").findByIdAndDelete(id);
        break;
      case "Admin":
        await mongoose.model("Admin").findByIdAndDelete(id);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`Failed to cascade delete persona (${model}):`, err);
  }
}

// Cascade delete persona after user is deleted
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.personaModel && doc.personaId) {
    await deletePersona(doc.personaModel, doc.personaId);
  }
});

module.exports = mongoose.model("User", userSchema);
