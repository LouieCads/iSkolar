const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  const user = new User({ email, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: "Signup successfully" });
};

exports.login = async (req, res) => {
  const { email, password, saveLogin } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Wrong email or password" });

  // Set token expiration based on saveLogin preference
  const expiresIn = saveLogin ? "30d" : "1h";

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  // Decode token to get expiry timestamp
  const decoded = jwt.decode(token);
  const expiresAt = decoded.exp * 1000; // JWT exp is in seconds, JS uses ms

  res.status(200).json({
    message: "Login successfully",
    token,
    expiresIn,
    expiresAt,
  });
};
