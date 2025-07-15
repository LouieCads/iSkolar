const User = require("../models/User");
const Platform = require("../models/Platform");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.updatePlatform = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    // Validate name is provided
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Platform name is required" });
    }

    // Find the platform document (there should only be one)
    let platform = await Platform.findOne();

    if (!platform) {
      // If no platform exists, create one
      platform = new Platform({ name: name.trim(), email, phoneNumber });
    } else {
      // Update existing platform fields
      platform.name = name.trim();
      if (email !== undefined) platform.email = email;
      if (phoneNumber !== undefined) platform.phoneNumber = phoneNumber;
    }

    await platform.save();

    res.status(200).json({
      message: "Platform updated successfully",
      platform: {
        name: platform.name,
        email: platform.email,
        phoneNumber: platform.phoneNumber,
        updatedAt: platform.updatedAt,
      },
    });
  } catch (error) {
    console.error("Platform update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPlatformName = async (req, res) => {
  try {
    let platform = await Platform.findOne();

    // If not found, create with defaults
    if (!platform) {
      platform = await Platform.create({});
    }

    res.status(200).json({
      platform: {
        name: platform.name,
        logoUrl: platform.logoUrl,
        email: platform.email,
        phoneNumber: platform.phoneNumber
      }
    });
  } catch (error) {
    console.error("Get platform name error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
