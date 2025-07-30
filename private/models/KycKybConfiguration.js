const mongoose = require("mongoose");

const KycKybConfigurationSchema = new mongoose.Schema({
  idTypes: {
    type: [String],
    default: ["UMID", "Passport", "Company ID"],
  },
  employmentType: {
    type: [String],
    default: ["Full-time", "Part-time", "Contractual", "Freelance", "Intern"],
  },
  natureOfWork: {
    type: [String],
    default: [
      "Teaching",
      "Programming",
      "Accounting",
      "Construction",
      "Customer Service",
    ],
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
