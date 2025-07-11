const User = require("../models/User");
const Student = require("../models/Student");
const Sponsor = require("../models/Sponsor");
const School = require("../models/School");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create user without role or persona (will be set after role selection)
    const user = new User({
      email,
      password: hashedPassword,
      role: null, // Will be set after role selection
      personaId: null, // Will be set after role selection
      personaModel: null, // Will be set after role selection
      isVerified: false,
      hasSelectedRole: false, // New field to track if user has selected role
    });

    await user.save();

    res.status(201).json({
      message: "Signup successful",
      requiresRoleSelection: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, saveLogin } = req.body;

    // Find user and populate persona if it exists
    const user = await User.findOne({ email }).populate("personaId");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(401).json({ message: "Account is suspended" });
    }

    // Check if user has selected a role
    if (!user.hasSelectedRole || !user.role) {
      // Set token expiration based on saveLogin preference
      const expiresIn = saveLogin ? "30d" : "1h";

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: null,
          personaId: null,
          personaModel: null,
          requiresRoleSelection: true,
        },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      // Decode token to get expiry timestamp
      const decoded = jwt.decode(token);
      const expiresAt = decoded.exp * 1000; // JWT exp is in seconds, JS uses ms

      return res.status(200).json({
        message: "Login successful",
        token,
        expiresIn,
        expiresAt,
        requiresRoleSelection: true,
        user: {
          id: user._id,
          email: user.email,
          role: null,
          personaId: null,
          personaModel: null,
          isVerified: false,
          requiresRoleSelection: true,
        },
      });
    }

    // User has selected role, proceed with normal login
    const expiresIn = saveLogin ? "30d" : "1h";

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        personaId: user.personaId?._id || null,
        personaModel: user.personaModel,
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Decode token to get expiry timestamp
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp * 1000; // JWT exp is in seconds, JS uses ms

    // Update last login for admin
    if (user.role === "admin" && user.personaId) {
      user.personaId.lastLoginAt = new Date();
      await user.personaId.save();
    }

    res.status(200).json({
      message: "Login successful",
      token,
      expiresIn,
      expiresAt,
      requiresRoleSelection: false,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        personaId: user.personaId?._id || null,
        personaModel: user.personaModel,
        isVerified: user.isVerified,
        persona: user.personaId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Select role after login
exports.selectRole = async (req, res) => {
  try {
    const {
      role,
      sponsorType, // for sponsor role
    } = req.body;

    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has a role
    if (user.hasSelectedRole && user.role) {
      return res.status(400).json({ message: "Role already selected" });
    }

    // Validate role
    const validRoles = ["student", "sponsor", "school", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create persona based on role (minimal fields only)
    let persona;
    let personaModel;

    switch (role) {
      case "student":
        persona = new Student({});
        personaModel = "Student";
        break;

      case "sponsor":
        if (
          !sponsorType ||
          !["individual", "corporate"].includes(sponsorType)
        ) {
          return res.status(400).json({
            message:
              "Sponsor type is required and must be 'individual' or 'corporate'",
          });
        }
        persona = new Sponsor({ sponsorType });
        personaModel = "Sponsor";
        break;

      case "school":
        persona = new School({}); 
        personaModel = "School";
        break;

      case "admin":
        persona = new Admin({}); 
        personaModel = "Admin";
        break;

      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // Save persona
    await persona.save();

    // Update user with role and persona
    user.role = role;
    user.personaId = persona._id;
    user.personaModel = personaModel;
    user.hasSelectedRole = true;
    await user.save();

    // Generate new token with role information
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        personaId: user.personaId,
        personaModel: user.personaModel,
      },
      process.env.JWT_SECRET,
    );

    res.status(200).json({
      message: "Role selected successfully",
      token,
      role,
      personaId: persona._id,
      requiresKYC: role !== "admin", // Admins don't need KYC
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        personaId: user.personaId,
        personaModel: user.personaModel,
        isVerified: user.isVerified,
        persona: persona,
      },
    });
  } catch (error) {
    console.error("Role selection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to check if user needs role selection
exports.checkRoleSelection = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      hasSelectedRole: user.hasSelectedRole,
      role: user.role,
      requiresRoleSelection: !user.hasSelectedRole || !user.role,
    });
  } catch (error) {
    console.error("Check role selection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user profile with populated persona
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("personaId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        personaId: user.personaId._id,
        personaModel: user.personaModel,
        isVerified: user.isVerified,
        persona: user.personaId,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
