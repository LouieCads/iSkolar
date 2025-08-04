// KycKybVerification.js
const mongoose = require("mongoose");

const kycKybVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  personaType: {
    type: String,
    enum: ["Student", "Sponsor", "School"],
    required: true,
  },
  status: {
    type: String,
    enum: ["unverified", "pending", "pre_approved", "verified", "denied"],
    default: "unverified",
  },
  resubmissionCount: {
    type: Number,
    default: 0,
    max: 3,
  },
  cooldownUntil: {
    type: Date,
  },
  declarationsAndConsent: {
    type: Boolean,
    required: true,
  },
  verifiedBy: {
    type: String, // Email of Admin or School Verifier
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
  denialReason: {
    type: String,
  },

  // Student-specific fields
  student: {
    fullName: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
    email: String,
    mobileNumber: String,
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    age: Number,
    civilStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    nationality: String,
    studentIdNumber: String,
    schoolName: String,
    schoolEmail: String,
    yearLevel: {
      type: String,
    },
    course: String,
    semestersPerYear: Number,
    dateOfBirth: Date,
    placeOfBirth: String,
    address: {
      country: String,
      province: String,
      city: String,
      barangay: String,
      street: String,
      zipCode: String,
    },
    educationalBackground: {
      elementary: { name: String, yearGraduated: Number },
      juniorHigh: { name: String, yearGraduated: Number },
      seniorHigh: { name: String, yearGraduated: Number },
      college: { name: String, expectedGraduation: Number },
    },
  },

  // Individual Sponsor-specific fields
  individualSponsor: {
    fullName: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
    email: String,
    mobileNumber: String,
    telephone: String,
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    age: Number,
    civilStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    nationality: String,
    dateOfBirth: Date,
    placeOfBirth: String,
    address: {
      country: String,
      province: String,
      city: String,
      barangay: String,
      street: String,
      zipCode: String,
    },
    natureOfWork: String,
    employmentType: {
      type: String,
    },
    sourceOfIncome: String,
    idDetails: {
      idType: String,
      idNumber: String,
    },
  },

  // Corporate Sponsor-specific fields
  corporateSponsor: {
    corporateName: String,
    organizationType: {
      type: String,
    },
    industrySector: String,
    registrationNumber: String,
    tin: String,
    dateOfIncorporation: Date,
    countryOfRegistration: String,
    authorizedRepresentative: {
      fullName: String,
      position: String,
      email: String,
      contactNumber: String,
      nationality: String,
      idType: String,
      idNumber: String,
    },
  },

  // School-specific fields
  school: {
    schoolName: String,
    schoolType: {
      type: String,
    },
    officialEmail: String,
    contactNumbers: [String],
    website: String,
    businessVerification: {
      accreditationCertificate: String,
      businessPermit: String,
      tin: String,
      schoolIdNumber: String,
    },
    campusAddress: {
      country: String,
      province: String,
      city: String,
      barangay: String,
      street: String,
      zipCode: String,
    },
    authorizedRepresentative: {
      fullName: String,
      position: String,
      email: String,
      contactNumber: String,
      nationality: String,
      idType: String,
      idNumber: String,
      schoolId: String,
      authorizationLetter: String,
    },
  },

  // Documents (common for all personas)
  documents: [
    {
      type: {
        type: String,
        enum: [
          "cor",
          "report_card",
          "government_id_front",
          "government_id_back",
          "proof_of_income",
          "company_logo",
          "business_registration",
          "articles_of_incorporation",
          "board_resolution",
          "gis",
          "accreditation_certificate",
          "business_permit",
          "bir_certificate",
          "authorization_letter",
        ],
      },
      fileName: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
    },
  ],

  // System fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
kycKybVerificationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (
    this.isModified("status") &&
    this.status === "denied" &&
    this.resubmissionCount < 3
  ) {
    this.cooldownUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days cooldown
  }
  next();
});

module.exports = mongoose.model("KycKybVerification", kycKybVerificationSchema);
