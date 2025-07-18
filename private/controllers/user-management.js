const User = require("../models/User");
const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const Sponsor = require("../models/Sponsor");
const School = require("../models/School");
const Admin = require("../models/Admin");

// Helper to delete persona by model and id
async function deletePersona(model, id) {
  if (!model || !id) return;
  try {
    switch (model) {
      case "Student":
        await Student.findByIdAndDelete(id);
        break;
      case "Sponsor":
        await Sponsor.findByIdAndDelete(id);
        break;
      case "School":
        await School.findByIdAndDelete(id);
        break;
      case "Admin":
        await Admin.findByIdAndDelete(id);
        break;
      default:
        break;
    }
  } catch (err) {
    // Log error but don't block user update
    console.error(`Failed to delete old persona (${model}):`, err);
  }
}

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  try {
    const { email, password, role, subRole, isVerified, status, adminLevel } =
      req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    let persona, personaModel;
    switch (role) {
      case "student":
        persona = new Student({});
        personaModel = "Student";
        break;
      case "sponsor":
        if (!subRole || !["individual", "corporate"].includes(subRole)) {
          return res.status(400).json({
            error: "Sponsor type must be 'individual' or 'corporate'",
          });
        }
        persona = new Sponsor({ subRole });
        personaModel = "Sponsor";
        break;
      case "school":
        persona = new School({});
        personaModel = "School";
        break;
      case "admin":
        persona = new Admin({ adminLevel: adminLevel || "admin" });
        personaModel = "Admin";
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }
    await persona.save();
    const user = new User({
      email,
      password: hashed,
      role,
      personaId: persona._id,
      personaModel,
      isVerified: !!isVerified,
      status: status || "active",
    });
    await user.save();
    res.status(201).json({
      message: "User created",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, subRole, isVerified, status, adminLevel } =
      req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    let persona, personaModel;
    if (role && role !== user.role) {
      // Delete old persona document
      await deletePersona(user.personaModel, user.personaId);
      // Create new persona
      switch (role) {
        case "student":
          persona = new Student({});
          personaModel = "Student";
          break;
        case "sponsor":
          if (!subRole || !["individual", "corporate"].includes(subRole)) {
            return res.status(400).json({
              error: "Sponsor type must be 'individual' or 'corporate'",
            });
          }
          persona = new Sponsor({ subRole });
          personaModel = "Sponsor";
          break;
        case "school":
          persona = new School({});
          personaModel = "School";
          break;
        case "admin":
          persona = new Admin({ adminLevel: adminLevel || "admin" });
          personaModel = "Admin";
          break;
        default:
          return res.status(400).json({ error: "Invalid role" });
      }
      await persona.save();
      user.role = role;
      user.personaId = persona._id;
      user.personaModel = personaModel;
    } else if (
      role === "sponsor" &&
      user.personaModel === "Sponsor" &&
      user.personaId &&
      subRole &&
      ["individual", "corporate"].includes(subRole)
    ) {
      // If sponsor type is updated, update subRole in Sponsor document
      await Sponsor.findByIdAndUpdate(user.personaId, { subRole });
    } else if (
      role === "admin" &&
      user.personaModel === "Admin" &&
      user.personaId &&
      adminLevel
    ) {
      // If admin level is updated, update adminLevel in Admin document
      await Admin.findByIdAndUpdate(user.personaId, { adminLevel });
    }
    if (typeof isVerified === "boolean") user.isVerified = isVerified;
    if (status && ["active", "suspended", "inactive"].includes(status))
      user.status = status;
    await user.save();
    res.json({
      message: "User updated",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Suspend/unsuspend user
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.status = suspend ? "suspended" : "active";
    await user.save();
    res.json({ message: suspend ? "User suspended" : "User unsuspended" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update suspension status" });
  }
};

// Assign role
exports.assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !["student", "sponsor", "school", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = role;
    await user.save();
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Assign status (active/suspended/inactive)
exports.assignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.status = status;
    await user.save();
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Assign verification (verified/unverified)
exports.assignVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    if (typeof verified !== "boolean") {
      return res.status(400).json({ error: "Invalid verification value" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isVerified = verified;
    await user.save();
    res.json({ message: "Verification updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update verification" });
  }
};
