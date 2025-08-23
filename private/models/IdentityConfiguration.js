const mongoose = require("mongoose");

const IdentityConfigurationSchema = new mongoose.Schema({
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
  schoolType: { // no controllers
    type: [String],
    default: ["Public", "Private", "International", "State University", "LGU"],
  },
});

module.exports = mongoose.model(
  "IdentityConfiguration",
  IdentityConfigurationSchema
);
