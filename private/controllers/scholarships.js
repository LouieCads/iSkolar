const Scholarship = require("../models/Scholarships");
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

  // Handle criteriaTags dynamically - just ensure it's an array and trim values
  if (Array.isArray(data.criteriaTags)) {
    result.criteriaTags = data.criteriaTags
      .map((tag) => (typeof tag === "string" ? tag.trim() : tag))
      .filter((tag) => tag && tag.length > 0); // Remove empty tags
  } else if (data.criteriaTags) {
    // Handle single string or other formats
    result.criteriaTags = [data.criteriaTags]
      .flat()
      .filter((tag) => tag && tag.length > 0);
  }

  // Handle requiredDocuments dynamically - just ensure it's an array
  if (Array.isArray(data.requiredDocuments)) {
    result.requiredDocuments = data.requiredDocuments.filter(
      (doc) => doc && doc.length > 0
    );
  } else if (data.requiredDocuments) {
    // Handle single string or other formats
    result.requiredDocuments = [data.requiredDocuments]
      .flat()
      .filter((doc) => doc && doc.length > 0);
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

// **NEW FUNCTION** - Get all scholarship banners for feed (public access)
const getAllScholarshipBanners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      scholarshipType,
      purpose,
      search,
      school,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query for active scholarships only
    const query = {
      status: "active",
      applicationDeadline: { $gt: new Date() }, // Only future deadlines
    };

    // Apply filters
    if (scholarshipType && scholarshipType !== "all") {
      query.scholarshipType = scholarshipType;
    }
    if (purpose && purpose !== "all") {
      query.purpose = purpose;
    }
    if (school && school !== "all") {
      query.selectedSchool = { $regex: school, $options: "i" };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { selectedSchool: { $regex: search, $options: "i" } },
        { criteriaTags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
    };

    // Execute query with pagination
    const scholarships = await Scholarship.find(query)
      .select(
        "bannerUrl title description scholarshipType purpose totalScholars amountPerScholar totalAmount selectedSchool applicationDeadline criteriaTags requiredDocuments sponsorId createdAt"
      )
      .populate("sponsorId", "organizationName logo contactInfo")
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .lean();

    const total = await Scholarship.countDocuments(query);

    // Transform data for frontend consumption
    const transformedScholarships = scholarships.map((scholarship) => ({
      id: scholarship._id,
      bannerUrl: scholarship.bannerUrl,
      title: scholarship.title,
      description: scholarship.description,
      scholarshipType: scholarship.scholarshipType,
      purpose: scholarship.purpose,
      totalScholars: scholarship.totalScholars,
      amountPerScholar: scholarship.amountPerScholar,
      totalAmount: scholarship.totalAmount,
      selectedSchool: scholarship.selectedSchool,
      applicationDeadline: scholarship.applicationDeadline,
      criteriaTags: scholarship.criteriaTags || [],
      requiredDocuments: scholarship.requiredDocuments || [],
      sponsor: scholarship.sponsorId
        ? {
            id: scholarship.sponsorId._id,
            name: scholarship.sponsorId.organizationName,
            logo: scholarship.sponsorId.logo,
            contactInfo: scholarship.sponsorId.contactInfo,
          }
        : null,
      createdAt: scholarship.createdAt,
      // Calculate remaining days
      daysRemaining: Math.ceil(
        (new Date(scholarship.applicationDeadline) - new Date()) /
          (1000 * 60 * 60 * 24)
      ),
    }));

    res.json({
      success: true,
      data: {
        scholarships: transformedScholarships,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
          hasNext: options.page < Math.ceil(total / options.limit),
          hasPrev: options.page > 1,
        },
        filters: {
          scholarshipType,
          purpose,
          search,
          school,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error("Get all scholarship banners error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// **NEW FUNCTION** - Get scholarship banner details for public view
const getScholarshipBannerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findOne({
      _id: id,
      status: "active",
      applicationDeadline: { $gt: new Date() },
    })
      .select("-applications -selectedScholars") // Exclude sensitive data
      .populate("sponsorId", "organizationName logo contactInfo website")
      .lean();

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found or no longer available",
      });
    }

    // Transform data for public consumption
    const transformedScholarship = {
      id: scholarship._id,
      bannerUrl: scholarship.bannerUrl,
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
      criteriaTags: scholarship.criteriaTags || [],
      requiredDocuments: scholarship.requiredDocuments || [],
      sponsor: scholarship.sponsorId
        ? {
            id: scholarship.sponsorId._id,
            name: scholarship.sponsorId.organizationName,
            logo: scholarship.sponsorId.logo,
            contactInfo: scholarship.sponsorId.contactInfo,
            website: scholarship.sponsorId.website,
          }
        : null,
      createdAt: scholarship.createdAt,
      daysRemaining: Math.ceil(
        (new Date(scholarship.applicationDeadline) - new Date()) /
          (1000 * 60 * 60 * 24)
      ),
      // Calculate application statistics (without sensitive data)
      applicationCount: scholarship.applications
        ? scholarship.applications.length
        : 0,
      availableSlots:
        scholarship.totalScholars -
        (scholarship.selectedScholars
          ? scholarship.selectedScholars.length
          : 0),
    };

    res.json({
      success: true,
      data: transformedScholarship,
    });
  } catch (error) {
    console.error("Get scholarship banner details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
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
      status: "active",
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
      mappedData.bannerUrl = `/private/public/uploads/scholarships/${req.file.filename}`;
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
  // **NEW EXPORTS** - Public functions for feed
  getAllScholarshipBanners,
  getScholarshipBannerDetails,
};
