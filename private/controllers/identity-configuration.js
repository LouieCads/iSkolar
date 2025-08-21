const KycKybConfiguration = require("../models/IdentityConfiguration");

// --- Get all KYC/KYB configuration details ---
exports.getKycKybConfiguration = async (req, res) => {
  try {
    let config = await KycKybConfiguration.findOne();
    if (!config) {
      // If no config exists, create one with default values
      config = new KycKybConfiguration();
      await config.save();
    }
    res.status(200).json(config);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching KYC/KYB configuration", error });
  }
};

// --- Generic function to add an item to a list ---
const addItem = async (res, field, item) => {
  try {
    if (!item || typeof item !== "string" || item.trim() === "") {
      return res.status(400).json({ message: "Item cannot be empty" });
    }
    const config = await KycKybConfiguration.findOne();
    if (config[field].includes(item)) {
      return res.status(409).json({ message: "Item already exists" });
    }
    config[field].push(item);
    await config.save();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: `Error adding item to ${field}`, error });
  }
};

// --- Generic function to update an item in a list ---
const updateItem = async (res, field, oldItem, newItem) => {
  try {
    if (!newItem || typeof newItem !== "string" || newItem.trim() === "") {
      return res.status(400).json({ message: "New item cannot be empty" });
    }
    const config = await KycKybConfiguration.findOne();
    const index = config[field].indexOf(oldItem);
    if (index === -1) {
      return res.status(404).json({ message: "Old item not found" });
    }
    if (config[field].includes(newItem) && oldItem !== newItem) {
      return res.status(409).json({ message: "Updated item already exists" });
    }
    config[field][index] = newItem;
    await config.save();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: `Error updating item in ${field}`, error });
  }
};

// --- Generic function to delete an item from a list ---
const deleteItem = async (res, field, item) => {
  try {
    const config = await KycKybConfiguration.findOne();
    const index = config[field].indexOf(item);
    if (index === -1) {
      return res.status(404).json({ message: "Item not found" });
    }
    config[field].splice(index, 1);
    await config.save();
    res.status(200).json(config);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting item from ${field}`, error });
  }
};

// --- Specific handlers for each field ---
exports.addIdType = (req, res) => addItem(res, "idTypes", req.body.item);
exports.updateIdType = (req, res) =>
  updateItem(res, "idTypes", req.body.oldItem, req.body.newItem);
exports.deleteIdType = (req, res) => deleteItem(res, "idTypes", req.body.item);

exports.addNatureOfWork = (req, res) =>
  addItem(res, "natureOfWork", req.body.item);
exports.updateNatureOfWork = (req, res) =>
  updateItem(res, "natureOfWork", req.body.oldItem, req.body.newItem);
exports.deleteNatureOfWork = (req, res) =>
  deleteItem(res, "natureOfWork", req.body.item);

exports.addEmploymentType = (req, res) =>
  addItem(res, "employmentType", req.body.item);
exports.updateEmploymentType = (req, res) =>
  updateItem(res, "employmentType", req.body.oldItem, req.body.newItem);
exports.deleteEmploymentType = (req, res) =>
  deleteItem(res, "employmentType", req.body.item);

exports.addSourceOfIncome = (req, res) =>
  addItem(res, "sourceOfIncome", req.body.item);
exports.updateSourceOfIncome = (req, res) =>
  updateItem(res, "sourceOfIncome", req.body.oldItem, req.body.newItem);
exports.deleteSourceOfIncome = (req, res) =>
  deleteItem(res, "sourceOfIncome", req.body.item);

exports.addOrganizationType = (req, res) =>
  addItem(res, "organizationType", req.body.item);
exports.updateOrganizationType = (req, res) =>
  updateItem(res, "organizationType", req.body.oldItem, req.body.newItem);
exports.deleteOrganizationType = (req, res) =>
  deleteItem(res, "organizationType", req.body.item);

exports.addIndustrySector = (req, res) =>
  addItem(res, "industrySector", req.body.item);
exports.updateIndustrySector = (req, res) =>
  updateItem(res, "industrySector", req.body.oldItem, req.body.newItem);
exports.deleteIndustrySector = (req, res) =>
  deleteItem(res, "industrySector", req.body.item);

exports.addSchoolType = (req, res) => addItem(res, "schoolType", req.body.item);
exports.updateSchoolType = (req, res) =>
  updateItem(res, "schoolType", req.body.oldItem, req.body.newItem);
exports.deleteSchoolType = (req, res) =>
  deleteItem(res, "schoolType", req.body.item);