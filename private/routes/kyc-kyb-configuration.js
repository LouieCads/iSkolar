const express = require("express");
const router = express.Router();
const {
  getKycKybConfiguration,
  addIdType,
  updateIdType,
  deleteIdType,
  addNatureOfWork,
  updateNatureOfWork,
  deleteNatureOfWork,
  addSourceOfIncome,
  updateSourceOfIncome,
  deleteSourceOfIncome,
  addOrganizationType,
  updateOrganizationType,
  deleteOrganizationType,
  addIndustrySector,
  updateIndustrySector,
  deleteIndustrySector,
  addEmploymentType,
  updateEmploymentType,
  deleteEmploymentType,
} = require("../controllers/kyc-kyb-configuration");

// --- Get all configuration ---
router.get("/kyc-kyb-configuration", getKycKybConfiguration);

// --- ID Types ---
router.post("/id-types", addIdType);
router.put("/id-types", updateIdType);
router.delete("/id-types", deleteIdType);

// --- Nature of Work ---
router.post("/nature-of-work", addNatureOfWork);
router.put("/nature-of-work", updateNatureOfWork);
router.delete("/nature-of-work", deleteNatureOfWork);

// --- Employment Type ---
router.post("/employment-type", addEmploymentType);
router.put("/employment-type", updateEmploymentType);
router.delete("/employment-type", deleteEmploymentType);

// --- Source of Income ---
router.post("/source-of-income", addSourceOfIncome);
router.put("/source-of-income", updateSourceOfIncome);
router.delete("/source-of-income", deleteSourceOfIncome);

// --- Organization Type ---
router.post("/organization-type", addOrganizationType);
router.put("/organization-type", updateOrganizationType);
router.delete("/organization-type", deleteOrganizationType);

// --- Industry Sector ---
router.post("/industry-sector", addIndustrySector);
router.put("/industry-sector", updateIndustrySector);
router.delete("/industry-sector", deleteIndustrySector);

module.exports = router;
