const mongoose = require("mongoose");

const CredentialsSchema = new mongoose.Schema({
  documentType: {
    type: [String],
    required: true,
    default: ["docx", "pdf", "png", "jpg", "svg"],
  },
  fileSize: {
    type: Number,
    required: true,
    default: 5, // MB
  },
});

module.exports = mongoose.model("Credentials", CredentialsSchema);
