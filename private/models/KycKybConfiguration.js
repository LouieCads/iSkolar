const mongoose = require("mongoose");

const KycKybConfigurationSchema = new mongoose.Schema({
  idTypes: {
    type: [String],
    default: ["UMID", "Passport", "Company ID"],
  },
  natureOfWork: {
    type: [String],
    default: ["Employed", "Self-Employed", "Student", "Retired"],
  },
  sourceOfIncome: {
    type: [String],
    default: ["Salary", "Business", "Scholarship", "Allowance"],
  },
  organizationType: {
    type: [String],
    default: ["Corporation", "NGO", "Cooperative", "Sole Proprietorship"],
  },
  industrySector: {
    type: [String],
    default: ["Education", "Finance", "Healthcare", "Technology"],
  },
});

module.exports = mongoose.model(
  "KycKybConfiguration",
  KycKybConfigurationSchema
);
