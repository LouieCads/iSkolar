const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const platformRoutes = require("./routes/platform");

dotenv.config();
const app = express();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());

// Serve uploaded logos and public assets
app.use("/public", express.static("public/public"));

// Routes
app.use("/auth", authRoutes);
app.use("/platform", platformRoutes);

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
