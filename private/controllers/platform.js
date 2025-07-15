const User = require("../models/User");
const Platform = require("../models/Platform");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.updatePlatform = async (req, res) => {
  try {
    const { name, email, phoneNumber, facebook, twitter, instagram, linkedin } =
      req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Platform name is required" });
    }

    let platform = await Platform.findOne();
    if (!platform) {
      platform = new Platform({
        name: name.trim(),
        email,
        phoneNumber,
        facebook,
        twitter,
        instagram,
        linkedin,
      });
    } else {
      platform.name = name.trim();
      if (email !== undefined) platform.email = email;
      if (phoneNumber !== undefined) platform.phoneNumber = phoneNumber;
      if (facebook !== undefined) platform.facebook = facebook;
      if (twitter !== undefined) platform.twitter = twitter;
      if (instagram !== undefined) platform.instagram = instagram;
      if (linkedin !== undefined) platform.linkedin = linkedin;
    }

    await platform.save();

    res.status(200).json({
      message: "Platform updated successfully",
      platform: {
        name: platform.name,
        email: platform.email,
        phoneNumber: platform.phoneNumber,
        facebook: platform.facebook,
        twitter: platform.twitter,
        instagram: platform.instagram,
        linkedin: platform.linkedin,
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
    if (!platform) {
      platform = await Platform.create({});
    }
    res.status(200).json({
      platform: {
        name: platform.name,
        logoUrl: platform.logoUrl,
        email: platform.email,
        phoneNumber: platform.phoneNumber,
        facebook: platform.facebook,
        twitter: platform.twitter,
        instagram: platform.instagram,
        linkedin: platform.linkedin,
      },
    });
  } catch (error) {
    console.error("Get platform name error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
