const User = require("../models/User");
const bcrypt = require("bcrypt");

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
    const { email, password, role, isVerified, isActive, isSuspended } =
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
    const user = new User({
      email,
      password: hashed,
      role,
      isVerified: !!isVerified,
      isActive: isActive !== false,
      isSuspended: !!isSuspended,
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
    const { email, password, role, isVerified, isActive, isSuspended } =
      req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeof isSuspended === "boolean") user.isSuspended = isSuspended;
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
    user.isSuspended = !!suspend;
    user.isActive = !suspend;
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

// Assign status (active/suspended)
exports.assignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = status === "active";
    user.isSuspended = status === "suspended";
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
