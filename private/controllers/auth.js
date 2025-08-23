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
    if (user.status === "inactive") {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check if user is suspended
    if (user.status === "suspended") {
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
      subRole, // for sponsor role
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
        if (!subRole || !["individual", "corporate"].includes(subRole)) {
          return res.status(400).json({
            message:
              "Sponsor type is required and must be 'individual' or 'corporate'",
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
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "Role selected successfully",
      token,
      role,
      subRole, // Include subRole in response
      personaId: persona._id,
      requiresProfileSetup: role !== "admin", // Redirect to profile setup except for admin
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

exports.setupProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.role || !user.personaId) {
      return res.status(400).json({ message: "User must select role first" });
    }

    // Get the profile data from request body
    const { profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({ message: "Profile data is required" });
    }

    // Update persona based on role
    let persona;
    switch (user.role) {
      case "student":
        persona = await Student.findById(user.personaId);
        if (persona) {
          persona.profile = {
            username: profileData.username || "",
            gender: profileData.gender || "",
            age: profileData.age || null,
          };
          await persona.save();
        }
        break;

      case "sponsor":
        persona = await Sponsor.findById(user.personaId);
        if (persona) {
          if (persona.subRole === "individual") {
            persona.profile.individual = {
              username: profileData.username || "",
              gender: profileData.gender || "",
              age: profileData.age || null,
            };
          } else if (persona.subRole === "corporate") {
            persona.profile.corporate = {
              companyName: profileData.companyName || "",
              organizationType: profileData.organizationType || "",
              industrySector: profileData.industrySector || "",
            };
          }
          await persona.save();
        }
        break;

      case "school":
        persona = await School.findById(user.personaId);
        if (persona) {
          persona.profile = {
            schoolName: profileData.schoolName || "",
            schoolType: profileData.schoolType || "",
            yearEstablished: profileData.yearEstablished || null,
          };
          await persona.save();
        }
        break;

      case "admin":
        // Admin might not need profile setup, or can be handled differently
        persona = await Admin.findById(user.personaId);
        // Add admin profile logic if needed
        break;

      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    if (!persona) {
      return res.status(404).json({ message: "Persona not found" });
    }

    // Mark user as verified/completed profile setup
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: "Profile setup completed successfully",
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
    console.error("Profile setup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};