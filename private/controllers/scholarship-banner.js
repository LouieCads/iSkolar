const Scholarship = require("../models/ScholarshipBanner");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = "public/uploads/scholarships";
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `scholarship-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Helper function to map display values to enum values
const mapToEnumValues = (data) => {
  const mappings = {
    scholarshipType: {
      "Merit-based": "merit_based",
      "Skill-based": "skill_based",
      "Merit Based": "merit_based",
      "Skill Based": "skill_based",
    },
    purpose: {
      Tuition: "tuition",
      Allowance: "allowance",
    },
    requiredDocuments: {
      "Certificate of Enrollment": "id_card",
      "Transcript of Records": "academic_records",
      "Birth Certificate": "birth_certificate",
      "Academic Records": "academic_records",
      Certificates: "certificates",
      Awards: "awards",
      Essay: "essay",
      "ID Card": "id_card",
    },
  };

  const result = { ...data };

  // Map scholarshipType
  if (data.scholarshipType && mappings.scholarshipType[data.scholarshipType]) {
    result.scholarshipType = mappings.scholarshipType[data.scholarshipType];
  }

  // Map purpose
  if (data.purpose && mappings.purpose[data.purpose]) {
    result.purpose = mappings.purpose[data.purpose];
  }

  // Map requiredDocuments
  if (Array.isArray(data.requiredDocuments)) {
    result.requiredDocuments = data.requiredDocuments.map(
      (doc) => mappings.requiredDocuments[doc] || doc
    );
  }

  return result;
};

// Helper function to find or create school
const findOrCreateSchool = async (schoolName) => {
  // This is a placeholder - you'll need to implement based on your School model
  // For now, we'll just return a dummy ObjectId
  // In a real implementation, you'd:
  // 1. Check if school exists by name
  // 2. Create if it doesn't exist
  // 3. Return the school's ObjectId

  const mongoose = require("mongoose");
  return new mongoose.Types.ObjectId(); // Placeholder - replace with actual school lookup
};

// Create new scholarship
const createScholarship = async (req, res) => {
  try {
    const {
      title,
      description,
      scholarshipType,
      purpose,
      totalScholars,
      amountPerScholar,
      selectedSchool,
      selectionMode,
      applicationDeadline,
      criteriaTags,
      requiredDocuments,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !scholarshipType ||
      !purpose ||
      !totalScholars ||
      !amountPerScholar ||
      !selectedSchool ||
      !applicationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate date
    const deadline = new Date(applicationDeadline);
    if (deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be in the future",
      });
    }

    // Parse arrays if they're strings
    const parsedCriteriaTags = Array.isArray(criteriaTags)
      ? criteriaTags
      : criteriaTags
      ? JSON.parse(criteriaTags)
      : [];

    const parsedRequiredDocuments = Array.isArray(requiredDocuments)
      ? requiredDocuments
      : requiredDocuments
      ? JSON.parse(requiredDocuments)
      : [];

    // Prepare data for mapping
    const rawData = {
      title: title.trim(),
      description: description ? description.trim() : "",
      scholarshipType,
      purpose,
      totalScholars: parseInt(totalScholars),
      amountPerScholar: parseFloat(amountPerScholar),
      selectedSchool,
      selectionMode,
      applicationDeadline: deadline,
      criteriaTags: parsedCriteriaTags,
      requiredDocuments: parsedRequiredDocuments,
      sponsorId: req.user.personaId,
      status: "draft",
    };

    // Map display values to enum values
    const mappedData = mapToEnumValues(rawData);

    // Calculate total amount
    mappedData.totalAmount =
      mappedData.totalScholars * mappedData.amountPerScholar;

    // Find or create school and get schoolId
    mappedData.schoolId = await findOrCreateSchool(selectedSchool);

    // Handle banner image upload
    if (req.file) {
      mappedData.bannerUrl = `/public/uploads/scholarships/${req.file.filename}`;
    }

    // Create scholarship
    const scholarship = new Scholarship(mappedData);
    await scholarship.save();

    res.status(201).json({
      success: true,
      message: "Scholarship created successfully",
      data: {
        id: scholarship._id,
        title: scholarship.title,
        description: scholarship.description,
        scholarshipType: scholarship.scholarshipType,
        purpose: scholarship.purpose,
        totalScholars: scholarship.totalScholars,
        amountPerScholar: scholarship.amountPerScholar,
        totalAmount: scholarship.totalAmount,
        selectedSchool: scholarship.selectedSchool,
        selectionMode: scholarship.selectionMode,
        applicationDeadline: scholarship.applicationDeadline,
        criteriaTags: scholarship.criteriaTags,
        requiredDocuments: scholarship.requiredDocuments,
        bannerUrl: scholarship.bannerUrl,
        status: scholarship.status,
        createdAt: scholarship.createdAt,
      },
    });
  } catch (error) {
    console.error("Create scholarship error:", error);

    // Clean up uploaded file if scholarship creation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get scholarships (with pagination and filters)
const getScholarships = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      scholarshipType,
      purpose,
      search,
    } = req.query;

    const query = { sponsorId: req.user.personaId };

    // Apply filters
    if (status) query.status = status;
    if (scholarshipType) query.scholarshipType = scholarshipType;
    if (purpose) query.purpose = purpose;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const scholarships = await Scholarship.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .select("-applications -selectedScholars");

    const total = await Scholarship.countDocuments(query);

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get scholarships error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single scholarship
const getScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findOne({
      _id: id,
      sponsorId: req.user.personaId,
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    console.error("Get scholarship error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update scholarship
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find existing scholarship
    const scholarship = await Scholarship.findOne({
      _id: id,
      sponsorId: req.user.personaId,
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    // Prevent updates if scholarship is already active or closed
    if (scholarship.status === "closed" || scholarship.status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Cannot update closed or archived scholarships",
      });
    }

    // Handle banner image update
    if (req.file) {
      // Delete old banner if exists
      if (
        scholarship.bannerUrl &&
        scholarship.bannerUrl.startsWith("/public/")
      ) {
        try {
          await fs.unlink(scholarship.bannerUrl.replace("/public/", "public/"));
        } catch (error) {
          console.log("Old banner file not found or already deleted");
        }
      }
      updates.bannerUrl = `/public/uploads/scholarships/${req.file.filename}`;
    }

    // Parse arrays if needed
    if (updates.criteriaTags && typeof updates.criteriaTags === "string") {
      updates.criteriaTags = JSON.parse(updates.criteriaTags);
    }
    if (
      updates.requiredDocuments &&
      typeof updates.requiredDocuments === "string"
    ) {
      updates.requiredDocuments = JSON.parse(updates.requiredDocuments);
    }

    // Map display values to enum values for updates
    const mappedUpdates = mapToEnumValues(updates);

    // Recalculate totalAmount if relevant fields are being updated
    if (mappedUpdates.totalScholars || mappedUpdates.amountPerScholar) {
      const newTotalScholars =
        mappedUpdates.totalScholars || scholarship.totalScholars;
      const newAmountPerScholar =
        mappedUpdates.amountPerScholar || scholarship.amountPerScholar;
      mappedUpdates.totalAmount = newTotalScholars * newAmountPerScholar;
    }

    // Update scholarship
    const updatedScholarship = await Scholarship.findByIdAndUpdate(
      id,
      { ...mappedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Scholarship updated successfully",
      data: updatedScholarship,
    });
  } catch (error) {
    console.error("Update scholarship error:", error);

    // Clean up uploaded file if update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete scholarship
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findOne({
      _id: id,
      sponsorId: req.user.personaId,
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    // Prevent deletion if scholarship has applications or is active
    if (scholarship.applications && scholarship.applications.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete scholarship with existing applications",
      });
    }

    // Delete banner image if exists
    if (scholarship.bannerUrl && scholarship.bannerUrl.startsWith("/public/")) {
      try {
        await fs.unlink(scholarship.bannerUrl.replace("/public/", "public/"));
      } catch (error) {
        console.log("Banner file not found or already deleted");
      }
    }

    await Scholarship.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Scholarship deleted successfully",
    });
  } catch (error) {
    console.error("Delete scholarship error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  upload,
  createScholarship,
  getScholarships,
  getScholarship,
  updateScholarship,
  deleteScholarship,
};
