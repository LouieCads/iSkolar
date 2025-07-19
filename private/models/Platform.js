const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Platform name is required."],
    default: "iSkolar",
    unique: true,
  },
  logoUrl: {
    type: String,
    default: "/public/iSkolar_logo.png",
    trim: true,
    // validate: {
    //   validator: function (v) {
    //     return /^https?:\/\/.+\.(png|jpg|jpeg|gif|svg)$/i.test(v); // Basic URL + image extension validation
    //   },
    //   message: (props) => `${props.value} is not a valid image URL!`,
    // },
  },
  email: {
    type: String,
    trim: true,
    default: "iskolar@gmail.com",
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid contact email address",
    ],
  },
  phoneNumber: {
    type: String,
    default: "+63 966 564 0148",
    trim: true,
  },
  facebook: {
    type: String,
    default: "https://www.facebook.com/profile.php?id=61575967087555",
    trim: true,
  },
  twitter: {
    type: String,
    default: "https://twitter.com/iskolarph",
    trim: true,
  },
  instagram: {
    type: String,
    default: "https://instagram.com/iskolarph",
    trim: true,
  },
  linkedin: {
    type: String,
    default: "https://linkedin.com/company/iskolarph",
    trim: true,
  },
  platformFee: {
    type: Number,
    min: [0, "Platform fee cannot be negative."],
    max: [100, "Platform fee cannot exceed 100%."],
    default: 0, // Default to 0% if no fee initially
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
platformSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Platform", platformSchema);
