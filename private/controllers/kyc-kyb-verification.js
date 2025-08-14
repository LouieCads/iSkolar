// controllers/kyc-kyb-verification.js
const KycKybVerification = require("../models/KycKybVerification");
const School = require("../models/School");
const Student = require("../models/Student");
const User = require("../models/User");
const fs = require("fs").promises;
const path = require("path");

// Helper function to find existing persona record
const findExistingPersonaRecord = async (userId, personaType) => {
  const user = await User.findById(userId);
  if (!user || !user.personaId) {
    return null;
  }

  switch (personaType) {
    case "school":
      return await School.findById(user.personaId);
    case "student":
      return await Student.findById(user.personaId);
    case "sponsor":
      // Add Sponsor model import if needed
      // return await Sponsor.findById(user.personaId);
      return null;
    default:
      return null;
  }
};

// Get KYC/KYB status for current user
exports.getKycStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const kycVerification = await KycKybVerification.findOne({ userId });

    if (!kycVerification) {
      return res.status(200).json({ status: "unverified" });
    }

    res.status(200).json({
      id: kycVerification._id,
      status: kycVerification.status,
      personaType: kycVerification.personaType,
      submittedAt: kycVerification.submittedAt,
      verifiedAt: kycVerification.verifiedAt,
      denialReason: kycVerification.denialReason,
      cooldownUntil: kycVerification.cooldownUntil,
      resubmissionCount: kycVerification.resubmissionCount,
      documents: kycVerification.documents,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching KYC status", error: error.message });
  }
};

// Submit Student KYC - WITH SCHOOL ROUTING
exports.submitStudentKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentData = req.body;

    // Check if user already has a KYC record
    const existingKyc = await KycKybVerification.findOne({ userId });

    if (existingKyc && existingKyc.status === "verified") {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (existingKyc && existingKyc.status === "pending") {
      return res
        .status(400)
        .json({ message: "Verification is already pending" });
    }

    // Check cooldown period
    if (
      existingKyc &&
      existingKyc.cooldownUntil &&
      new Date() < existingKyc.cooldownUntil
    ) {
      return res.status(400).json({
        message: "Still in cooldown period",
        cooldownUntil: existingKyc.cooldownUntil,
      });
    }

    // Validate school selection
    const schoolName = studentData.student?.schoolName;
    if (!schoolName) {
      return res.status(400).json({ message: "School name is required." });
    }

    // Find the verified school by schoolName
    const school = await School.aggregate([
      {
        $match: {
          schoolName: new RegExp(`^${schoolName}$`, "i"),
        },
      },
      {
        $lookup: {
          from: "kyckybverifications",
          localField: "kycId",
          foreignField: "_id",
          as: "kycVerification",
        },
      },
      {
        $match: {
          "kycVerification.status": "verified",
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!school || school.length === 0) {
      return res.status(400).json({
        message:
          "Selected school not found or not verified. Please select a verified school from the dropdown.",
      });
    }

    const schoolRecord = school[0];

    // Find existing Student record
    const existingStudent = await findExistingPersonaRecord(userId, "student");

    const kycData = {
      userId,
      personaType: "student", // Fixed to lowercase
      status: "pending", // Will be pending until school pre-approves
      declarationsAndConsent: studentData.declarationsAndConsent,
      student: studentData.student,
      documents: studentData.documents || [],
      submittedAt: new Date(),
      schoolName: schoolRecord.schoolName, // Use the verified school name
      schoolId: schoolRecord._id, // Add school ID reference
    };

    let verification;
    if (existingKyc) {
      Object.assign(existingKyc, kycData);
      existingKyc.resubmissionCount = (existingKyc.resubmissionCount || 0) + 1;
      verification = await existingKyc.save();
    } else {
      verification = new KycKybVerification(kycData);
      await verification.save();
    }

    // Update or create Student record
    if (existingStudent) {
      existingStudent.schoolId = schoolRecord._id;
      existingStudent.kycId = verification._id;
      await existingStudent.save();
      console.log("Updated existing Student record");
    } else {
      // Create new Student record if none exists
      const newStudent = new Student({
        schoolId: schoolRecord._id,
        kycId: verification._id,
      });
      await newStudent.save();
      console.log("Created new Student record");
    }

    // Add to school's KYC review queue
    await School.updateOne(
      { _id: schoolRecord._id },
      {
        $addToSet: {
          kycReviewQueue: {
            verificationId: verification._id,
            studentName: `${studentData.student?.fullName?.firstName || ""} ${
              studentData.student?.fullName?.lastName || ""
            }`.trim(),
            schoolName: schoolRecord.schoolName,
            submittedAt: new Date(),
            status: "pending",
          },
        },
      }
    );

    const message = existingKyc
      ? "Student KYC resubmitted successfully and sent to school for review"
      : "Student KYC submitted successfully and sent to school for review";

    res.status(existingKyc ? 200 : 201).json({
      message,
      verification,
      schoolName: schoolRecord.schoolName,
      nextStep: "Waiting for school pre-approval",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting Student KYC", error: error.message });
  }
};

// Get school's KYC review queue (by schoolName)
exports.getSchoolKycQueue = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find the school where this user is a verifier
    const school = await School.findOne({ "verifiers.userId": userId });
    if (!school) {
      return res
        .status(404)
        .json({ message: "School not found or unauthorized" });
    }
    // Fetch KYC verifications for this schoolName
    const kycVerifications = await KycKybVerification.find({
      schoolName: school.schoolName,
      personaType: "Student",
      status: { $in: ["pending", "pre_approved", "denied"] },
    });
    // Optionally, filter queue for only pending
    const pendingQueue = school.kycReviewQueue.filter(
      (item) =>
        item.status === "pending" && item.schoolName === school.schoolName
    );
    res.status(200).json({
      queue: pendingQueue,
      kycVerifications,
      count: pendingQueue.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching school KYC queue",
      error: error.message,
    });
  }
};

// Pre-approve student (by school) - with schoolName validation
exports.preApproveStudent = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reviewerNotes } = req.body;
    const verifierEmail = req.user.email;
    const verifierId = req.user.id;
    // Check if user is a school verifier
    if (req.user.role !== "school_verifier" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to pre-approve students" });
    }
    const verification = await KycKybVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    // Find the school for the logged-in user
    const school = await School.findOne({ "verifiers.userId": req.user.id });
    if (!school || verification.schoolName !== school.schoolName) {
      return res.status(403).json({
        message: "Unauthorized: Cannot review KYC for another school",
      });
    }
    if (verification.personaType !== "Student") {
      return res
        .status(400)
        .json({ message: "Pre-approval is only for students" });
    }
    if (verification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only pre-approve pending verifications" });
    }
    // Update verification status
    verification.status = "pre_approved";
    verification.verifiedBy = verifierEmail;
    verification.updatedAt = new Date();
    await verification.save();
    // Update school's KYC queue
    await School.updateOne(
      {
        "kycReviewQueue.verificationId": verificationId,
        schoolName: school.schoolName,
      },
      {
        $set: {
          "kycReviewQueue.$.status": "pre_approved",
          "kycReviewQueue.$.reviewedAt": new Date(),
          "kycReviewQueue.$.reviewerNotes": reviewerNotes || "",
          "kycReviewQueue.$.reviewedBy": verifierEmail,
        },
      }
    );
    res.status(200).json({
      message: "Student pre-approved successfully and forwarded to admin",
      verification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error pre-approving student", error: error.message });
  }
};

// Deny student KYC at school level - with schoolName validation
exports.denyStudentAtSchool = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { denialReason, reviewerNotes } = req.body;
    const verifierEmail = req.user.email;
    if (req.user.role !== "school_verifier" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const verification = await KycKybVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    // Find the school for the logged-in user
    const school = await School.findOne({ "verifiers.userId": req.user.id });
    if (!school || verification.schoolName !== school.schoolName) {
      return res.status(403).json({
        message: "Unauthorized: Cannot review KYC for another school",
      });
    }
    if (verification.personaType !== "Student") {
      return res
        .status(400)
        .json({ message: "This action is only for students" });
    }
    if (verification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only deny pending verifications" });
    }
    // Update verification status
    verification.status = "denied";
    verification.verifiedBy = verifierEmail;
    verification.denialReason = denialReason;
    verification.updatedAt = new Date();
    await verification.save();
    // Update school's KYC queue
    await School.updateOne(
      {
        "kycReviewQueue.verificationId": verificationId,
        schoolName: school.schoolName,
      },
      {
        $set: {
          "kycReviewQueue.$.status": "denied",
          "kycReviewQueue.$.reviewedAt": new Date(),
          "kycReviewQueue.$.reviewerNotes": reviewerNotes || "",
          "kycReviewQueue.$.reviewedBy": verifierEmail,
        },
      }
    );
    res.status(200).json({
      message: "Student KYC denied at school level",
      verification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error denying student KYC",
      error: error.message,
    });
  }
};

// Submit Individual Sponsor KYB
exports.submitIndividualSponsorKyb = async (req, res) => {
  try {
    console.log("=== Individual Sponsor KYB Submission ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.user.id;
    const sponsorData = req.body;

    // Validate required fields - declarationsAndConsent should be boolean
    if (
      typeof sponsorData.declarationsAndConsent !== "boolean" ||
      !sponsorData.declarationsAndConsent
    ) {
      return res
        .status(400)
        .json({ message: "Declarations and consent are required" });
    }

    if (!sponsorData.individualSponsor) {
      return res
        .status(400)
        .json({ message: "Individual sponsor data is required" });
    }

    // Validate required individual sponsor fields
    const { individualSponsor } = sponsorData;
    if (
      !individualSponsor.fullName?.firstName ||
      !individualSponsor.fullName?.lastName
    ) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    if (!individualSponsor.email || !individualSponsor.mobileNumber) {
      return res
        .status(400)
        .json({ message: "Email and mobile number are required" });
    }

    const existingKyb = await KycKybVerification.findOne({ userId });

    if (existingKyb && existingKyb.status === "verified") {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (existingKyb && existingKyb.status === "pending") {
      return res
        .status(400)
        .json({ message: "Verification is already pending" });
    }

    if (
      existingKyb &&
      existingKyb.cooldownUntil &&
      new Date() < existingKyb.cooldownUntil
    ) {
      return res.status(400).json({
        message: "Still in cooldown period",
        cooldownUntil: existingKyb.cooldownUntil,
      });
    }

    const kybData = {
      userId,
      personaType: "Sponsor",
      status: "pending",
      declarationsAndConsent: sponsorData.declarationsAndConsent, // Boolean
      individualSponsor: sponsorData.individualSponsor,
      documents: sponsorData.documents || [],
      submittedAt: new Date(),
    };

    if (existingKyb) {
      Object.assign(existingKyb, kybData);
      existingKyb.resubmissionCount = (existingKyb.resubmissionCount || 0) + 1;
      await existingKyb.save();

      console.log("Individual Sponsor KYB updated successfully");
      res.status(200).json({
        message: "Individual Sponsor KYB resubmitted successfully",
        verification: existingKyb,
      });
    } else {
      const newKyb = new KycKybVerification(kybData);
      await newKyb.save();

      console.log("Individual Sponsor KYB created successfully");
      res.status(201).json({
        message: "Individual Sponsor KYB submitted successfully",
        verification: newKyb,
      });
    }
  } catch (error) {
    console.error("Individual Sponsor KYB Error:", error);
    res.status(500).json({
      message: "Error submitting Individual Sponsor KYB",
      error: error.message,
    });
  }
};

// Submit Corporate Sponsor KYB
exports.submitCorporateSponsorKyb = async (req, res) => {
  try {
    console.log("=== Corporate Sponsor KYB Submission ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.user.id;
    const corporateData = req.body;

    // Validate required fields - declarationsAndConsent should be boolean
    if (
      typeof corporateData.declarationsAndConsent !== "boolean" ||
      !corporateData.declarationsAndConsent
    ) {
      return res
        .status(400)
        .json({ message: "Declarations and consent are required" });
    }

    if (!corporateData.corporateSponsor) {
      return res
        .status(400)
        .json({ message: "Corporate sponsor data is required" });
    }

    // Validate required corporate sponsor fields
    const { corporateSponsor } = corporateData;
    if (!corporateSponsor.corporateName) {
      return res.status(400).json({ message: "Corporate name is required" });
    }

    if (!corporateSponsor.authorizedRepresentative?.fullName) {
      return res
        .status(400)
        .json({ message: "Authorized representative information is required" });
    }

    const existingKyb = await KycKybVerification.findOne({ userId });

    if (existingKyb && existingKyb.status === "verified") {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (existingKyb && existingKyb.status === "pending") {
      return res
        .status(400)
        .json({ message: "Verification is already pending" });
    }

    if (
      existingKyb &&
      existingKyb.cooldownUntil &&
      new Date() < existingKyb.cooldownUntil
    ) {
      return res.status(400).json({
        message: "Still in cooldown period",
        cooldownUntil: existingKyb.cooldownUntil,
      });
    }

    const kybData = {
      userId,
      personaType: "Sponsor",
      status: "pending",
      declarationsAndConsent: corporateData.declarationsAndConsent, // Boolean
      corporateSponsor: corporateData.corporateSponsor,
      documents: corporateData.documents || [],
      submittedAt: new Date(),
    };

    if (existingKyb) {
      Object.assign(existingKyb, kybData);
      existingKyb.resubmissionCount = (existingKyb.resubmissionCount || 0) + 1;
      await existingKyb.save();

      console.log("Corporate Sponsor KYB updated successfully");
      res.status(200).json({
        message: "Corporate Sponsor KYB resubmitted successfully",
        verification: existingKyb,
      });
    } else {
      const newKyb = new KycKybVerification(kybData);
      await newKyb.save();

      console.log("Corporate Sponsor KYB created successfully");
      res.status(201).json({
        message: "Corporate Sponsor KYB submitted successfully",
        verification: newKyb,
      });
    }
  } catch (error) {
    console.error("Corporate Sponsor KYB Error:", error);
    res.status(500).json({
      message: "Error submitting Corporate Sponsor KYB",
      error: error.message,
    });
  }
};

// Submit School KYB
exports.submitSchoolKyb = async (req, res) => {
  try {
    console.log("=== School KYB Submission ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const userId = req.user.id;
    const schoolData = req.body;

    // Validate required fields
    if (!schoolData.declarationsAndConsent) {
      return res
        .status(400)
        .json({ message: "Declarations and consent are required" });
    }

    if (!schoolData.school || !schoolData.school.schoolName) {
      return res.status(400).json({ message: "School name is required" });
    }

    if (!schoolData.school.schoolType) {
      return res.status(400).json({ message: "School type is required" });
    }

    if (!schoolData.school.officialEmail) {
      return res.status(400).json({ message: "Official email is required" });
    }

    if (
      !schoolData.school.contactNumbers ||
      schoolData.school.contactNumbers.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one contact number is required" });
    }

    if (
      !schoolData.school.businessVerification ||
      !schoolData.school.businessVerification.tin
    ) {
      return res.status(400).json({ message: "TIN is required" });
    }

    if (
      !schoolData.school.businessVerification ||
      !schoolData.school.businessVerification.schoolIdNumber
    ) {
      return res.status(400).json({ message: "School ID number is required" });
    }

    if (
      !schoolData.school.authorizedRepresentative ||
      !schoolData.school.authorizedRepresentative.fullName
    ) {
      return res
        .status(400)
        .json({ message: "Authorized representative full name is required" });
    }

    const existingKyb = await KycKybVerification.findOne({ userId });

    if (existingKyb && existingKyb.status === "verified") {
      return res.status(400).json({ message: "School is already verified" });
    }

    if (existingKyb && existingKyb.status === "pending") {
      return res
        .status(400)
        .json({ message: "Verification is already pending" });
    }

    if (
      existingKyb &&
      existingKyb.cooldownUntil &&
      new Date() < existingKyb.cooldownUntil
    ) {
      return res.status(400).json({
        message: "Still in cooldown period",
        cooldownUntil: existingKyb.cooldownUntil,
      });
    }

    const kycData = {
      userId,
      personaType: "school", // Convert to lowercase to match model enum
      status: "pending",
      declarationsAndConsent: schoolData.declarationsAndConsent,
      school: schoolData.school,
      fileNames: schoolData.documents || [], // Use fileNames instead of documents
      submittedAt: new Date(),
    };

    let verification;
    if (existingKyb) {
      Object.assign(existingKyb, kycData);
      existingKyb.resubmissionCount = (existingKyb.resubmissionCount || 0) + 1;
      verification = await existingKyb.save();
    } else {
      verification = new KycKybVerification(kycData);
      await verification.save();
    }

    // Find existing School record by userId (from User model) or create new one
    const existingSchool = await findExistingPersonaRecord(userId, "school");

    if (existingSchool) {
      // Update existing School record
      existingSchool.schoolName = schoolData.school.schoolName;
      existingSchool.schoolType = schoolData.school.schoolType;
      existingSchool.kycId = verification._id;
      await existingSchool.save();
      console.log("Updated existing School record");
    } else {
      // Create new School record only if none exists
      const schoolRecord = new School({
        schoolName: schoolData.school.schoolName,
        schoolType: schoolData.school.schoolType,
        kycId: verification._id,
      });
      await schoolRecord.save();
      console.log("Created new School record");
    }

    console.log("School KYB submitted successfully");
    res.status(existingKyb ? 200 : 201).json({
      message: existingKyb
        ? "School KYB resubmitted successfully"
        : "School KYB submitted successfully",
      verification,
    });
  } catch (error) {
    console.error("School KYB Error:", error);
    res
      .status(500)
      .json({ message: "Error submitting School KYB", error: error.message });
  }
};

// Pre-approve student (by school)
exports.preApproveStudent = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const verifierEmail = req.user.email;

    // Check if user is a school verifier
    if (req.user.role !== "school_verifier" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to pre-approve students" });
    }

    const verification = await KycKybVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    if (verification.personaType !== "Student") {
      return res
        .status(400)
        .json({ message: "Pre-approval is only for students" });
    }

    if (verification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Can only pre-approve pending verifications" });
    }

    verification.status = "pre-approved";
    verification.verifiedBy = verifierEmail;
    verification.updatedAt = new Date();

    await verification.save();

    res.status(200).json({
      message: "Student pre-approved successfully",
      verification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error pre-approving student", error: error.message });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const verification = await KycKybVerification.findOne({ userId });

    if (!verification) {
      return res.status(404).json({ message: "Verification record not found" });
    }

    const newDocument = {
      type: documentType,
      fileName: req.file.originalname,
      fileUrl: `/public/documents/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    verification.documents.push(newDocument);
    await verification.save();

    res.status(200).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading document", error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const verification = await KycKybVerification.findOne({ userId });

    if (!verification) {
      return res.status(404).json({ message: "Verification record not found" });
    }

    const documentIndex = verification.documents.findIndex(
      (doc) => doc._id.toString() === documentId
    );

    if (documentIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = verification.documents[documentIndex];

    // Delete file from filesystem
    try {
      await fs.unlink(path.join(__dirname, "..", document.fileUrl));
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
    }

    verification.documents.splice(documentIndex, 1);
    await verification.save();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting document", error: error.message });
  }
};

// Get verification by ID (Admin/School verifier)
exports.getVerificationById = async (req, res) => {
  try {
    const { verificationId } = req.params;

    if (req.user.role !== "admin" && req.user.role !== "school_verifier") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const verification = await KycKybVerification.findById(
      verificationId
    ).populate("userId", "email");

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    res.status(200).json({ verification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching verification", error: error.message });
  }
};

// Get all verifications (Admin)
exports.getAllVerifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      page = 1,
      limit = 10,
      status,
      personaType,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (personaType) filter.personaType = personaType;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const verifications = await KycKybVerification.find(filter)
      .populate("userId", "email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await KycKybVerification.countDocuments(filter);

    res.status(200).json({
      verifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching verifications", error: error.message });
  }
};

// Update verification status (Admin)
exports.updateVerificationStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { verificationId } = req.params;
    const { status, denialReason } = req.body;

    const verification = await KycKybVerification.findById(verificationId);

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    verification.status = status;
    verification.verifiedBy = req.user.email;
    verification.updatedAt = new Date();

    if (status === "verified") {
      verification.verifiedAt = new Date();
    }

    if (status === "denied" && denialReason) {
      verification.denialReason = denialReason;
    }

    await verification.save();

    // Note: School verification status is now tracked through KycKybVerification
    // No need to update School.verificationStatus anymore

    res.status(200).json({
      message: `Verification ${status} successfully`,
      verification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating verification status",
      error: error.message,
    });
  }
};

// Get verification history for current user
exports.getVerificationHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const verifications = await KycKybVerification.find({ userId }).sort({
      submittedAt: -1,
    });

    res.status(200).json({ verifications });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching verification history",
      error: error.message,
    });
  }
};

// Resubmit verification
exports.resubmitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const verification = await KycKybVerification.findOne({ userId });

    if (!verification) {
      return res.status(404).json({ message: "Verification record not found" });
    }

    if (verification.status !== "denied") {
      return res
        .status(400)
        .json({ message: "Can only resubmit denied verifications" });
    }

    if (verification.resubmissionCount >= 3) {
      return res
        .status(400)
        .json({ message: "Maximum resubmission limit reached" });
    }

    if (verification.cooldownUntil && new Date() < verification.cooldownUntil) {
      return res.status(400).json({
        message: "Still in cooldown period",
        cooldownUntil: verification.cooldownUntil,
      });
    }

    // Update verification data based on persona type
    if (verification.personaType === "Student") {
      verification.student = { ...verification.student, ...updateData.student };
    } else if (verification.personaType === "Sponsor") {
      if (updateData.individualSponsor) {
        verification.individualSponsor = {
          ...verification.individualSponsor,
          ...updateData.individualSponsor,
        };
      }
      if (updateData.corporateSponsor) {
        verification.corporateSponsor = {
          ...verification.corporateSponsor,
          ...updateData.corporateSponsor,
        };
      }
    } else if (verification.personaType === "School") {
      verification.school = { ...verification.school, ...updateData.school };
    }

    verification.status = "pending";
    verification.denialReason = undefined;
    verification.cooldownUntil = undefined;
    verification.resubmissionCount += 1;
    verification.submittedAt = new Date();

    await verification.save();

    res.status(200).json({
      message: "Verification resubmitted successfully",
      verification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resubmitting verification",
      error: error.message,
    });
  }
};

// Bulk update verification status (Admin)
exports.bulkUpdateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { verificationIds, status, denialReason } = req.body;

    if (!verificationIds || !Array.isArray(verificationIds)) {
      return res.status(400).json({ message: "Invalid verification IDs" });
    }

    const updateData = {
      status,
      verifiedBy: req.user.email,
      updatedAt: new Date(),
    };

    if (status === "verified") {
      updateData.verifiedAt = new Date();
    }

    if (status === "denied" && denialReason) {
      updateData.denialReason = denialReason;
    }

    const result = await KycKybVerification.updateMany(
      { _id: { $in: verificationIds } },
      updateData
    );

    res.status(200).json({
      message: `${result.modifiedCount} verifications updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bulk updating verifications",
      error: error.message,
    });
  }
};

// Get verification statistics (Admin)
exports.getVerificationStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const stats = await KycKybVerification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unverified: {
            $sum: { $cond: [{ $eq: ["$status", "unverified"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          preApproved: {
            $sum: { $cond: [{ $eq: ["$status", "pre-approved"] }, 1, 0] },
          },
          verified: {
            $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
          },
          denied: { $sum: { $cond: [{ $eq: ["$status", "denied"] }, 1, 0] } },
        },
      },
    ]);

    const personaStats = await KycKybVerification.aggregate([
      {
        $group: {
          _id: "$personaType",
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      overall: stats[0] || {
        total: 0,
        unverified: 0,
        pending: 0,
        preApproved: 0,
        verified: 0,
        denied: 0,
      },
      byPersonaType: personaStats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching verification stats",
      error: error.message,
    });
  }
};
