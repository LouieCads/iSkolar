const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Student", "Admin", "Sponsor"
  permissions: [String], // e.g., ["create_scholarship", "view_users", "edit_profile"]
});

module.exports = mongoose.model("Role", roleSchema);
