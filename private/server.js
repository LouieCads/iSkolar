const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const platformRoutes = require("./routes/platform");
const userManagementRoutes = require("./routes/user-management");
const academicDetailsRoutes = require("./routes/academic-details");
const scholarshipDetailsRoutes = require("./routes/scholarship-details");
const credentialsRoutes = require("./routes/credentials");
const tokenPaymentRoutes = require("./routes/token-payment");
const kycKybConfigurationRoutes = require("./routes/kyc-kyb-configuration");
const kycKybVerificationRoutes = require("./routes/kyc-kyb-verification");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

// Serve uploaded logos and public assets
app.use("/public", express.static("public/public"));

// Routes
app.use("/auth", authRoutes);
app.use("/platform", platformRoutes);
app.use("/user-management", userManagementRoutes);
app.use("/academic-details", academicDetailsRoutes);
app.use("/scholarship-details", scholarshipDetailsRoutes);
app.use("/credentials", credentialsRoutes);
app.use("/token-payment", tokenPaymentRoutes);
app.use("/kyc-kyb-configuration", kycKybConfigurationRoutes);
app.use("/kyc-kyb-verification", kycKybVerificationRoutes);

// connection
mongoose
  .connect(MONGODB_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
