const AcademicDetails = require("../models/AcademicDetails");
const School = require("../models/School");

// Get all academic details
exports.getAcademicDetails = async (req, res) => {
  try {
    let details = await AcademicDetails.findOne();
    if (!details) {
      details = await AcademicDetails.create({});
    }
    res.json({
      course: details.course,
      semester: details.semester,
      yearLevel: details.yearLevel,
      school: details.school,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch academic details" });
  }
};

// Get verified schools for student KYC form
exports.getVerifiedSchools = async (req, res) => {
  try {
    // Find schools that have verified KYC/KYB records
    const verifiedSchools = await School.aggregate([
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
        $project: {
          schoolName: 1,
          schoolType: 1,
        },
      },
    ]);

    res.json({
      schools: verifiedSchools.map((school) => ({
        name: school.schoolName,
        type: school.schoolType,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch verified schools" });
  }
};

// --- COURSE ---
exports.addCourse = async (req, res) => {
  try {
    const { course } = req.body;
    if (!course || typeof course !== "string") {
      return res.status(400).json({ message: "Course is required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) details = await AcademicDetails.create({});
    if (details.course.includes(course)) {
      return res.status(409).json({ message: "Course already exists" });
    }
    details.course.push(course);
    await details.save();
    res.json({ course: details.course });
  } catch (err) {
    res.status(500).json({ message: "Failed to add course" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { oldCourse, newCourse } = req.body;
    if (!oldCourse || !newCourse) {
      return res
        .status(400)
        .json({ message: "Both oldCourse and newCourse are required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.course.indexOf(oldCourse);
    if (idx === -1)
      return res.status(404).json({ message: "Course not found" });
    details.course[idx] = newCourse;
    await details.save();
    res.json({ course: details.course });
  } catch (err) {
    res.status(500).json({ message: "Failed to update course" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { course } = req.body;
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.course = details.course.filter((c) => c !== course);
    await details.save();
    res.json({ course: details.course });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};

// --- SEMESTER ---
exports.addSemester = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester || typeof semester !== "string") {
      return res.status(400).json({ message: "Semester is required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) details = await AcademicDetails.create({});
    if (details.semester.includes(semester)) {
      return res.status(409).json({ message: "Semester already exists" });
    }
    details.semester.push(semester);
    await details.save();
    res.json({ semester: details.semester });
  } catch (err) {
    res.status(500).json({ message: "Failed to add semester" });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const { oldSemester, newSemester } = req.body;
    if (!oldSemester || !newSemester) {
      return res
        .status(400)
        .json({ message: "Both oldSemester and newSemester are required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.semester.indexOf(oldSemester);
    if (idx === -1)
      return res.status(404).json({ message: "Semester not found" });
    details.semester[idx] = newSemester;
    await details.save();
    res.json({ semester: details.semester });
  } catch (err) {
    res.status(500).json({ message: "Failed to update semester" });
  }
};

exports.deleteSemester = async (req, res) => {
  try {
    const { semester } = req.body;
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.semester = details.semester.filter((s) => s !== semester);
    await details.save();
    res.json({ semester: details.semester });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete semester" });
  }
};

// --- YEAR LEVEL ---
exports.addYearLevel = async (req, res) => {
  try {
    const { yearLevel } = req.body;
    if (!yearLevel || typeof yearLevel !== "string") {
      return res.status(400).json({ message: "Year level is required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) details = await AcademicDetails.create({});
    if (details.yearLevel.includes(yearLevel)) {
      return res.status(409).json({ message: "Year level already exists" });
    }
    details.yearLevel.push(yearLevel);
    await details.save();
    res.json({ yearLevel: details.yearLevel });
  } catch (err) {
    res.status(500).json({ message: "Failed to add year level" });
  }
};

exports.updateYearLevel = async (req, res) => {
  try {
    const { oldYearLevel, newYearLevel } = req.body;
    if (!oldYearLevel || !newYearLevel) {
      return res
        .status(400)
        .json({ message: "Both oldYearLevel and newYearLevel are required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.yearLevel.indexOf(oldYearLevel);
    if (idx === -1)
      return res.status(404).json({ message: "Year level not found" });
    details.yearLevel[idx] = newYearLevel;
    await details.save();
    res.json({ yearLevel: details.yearLevel });
  } catch (err) {
    res.status(500).json({ message: "Failed to update year level" });
  }
};

exports.deleteYearLevel = async (req, res) => {
  try {
    const { yearLevel } = req.body;
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.yearLevel = details.yearLevel.filter((y) => y !== yearLevel);
    await details.save();
    res.json({ yearLevel: details.yearLevel });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete year level" });
  }
};

// --- SCHOOL ---
exports.addSchoolType = async (req, res) => {
  try {
    const { school } = req.body;
    if (!school || typeof school !== "string") {
      return res.status(400).json({ message: "School is required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) details = await AcademicDetails.create({});
    if (details.school.includes(school)) {
      return res.status(409).json({ message: "School already exists" });
    }
    details.school.push(school);
    await details.save();
    res.json({ school: details.school });
  } catch (err) {
    res.status(500).json({ message: "Failed to add school" });
  }
};

exports.updateSchoolType = async (req, res) => {
  try {
    const { oldSchool, newSchool } = req.body;
    if (!oldSchool || !newSchool) {
      return res
        .status(400)
        .json({ message: "Both oldSchool and newSchool are required" });
    }
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    const idx = details.school.indexOf(oldSchool);
    if (idx === -1)
      return res.status(404).json({ message: "School not found" });
    details.school[idx] = newSchool;
    await details.save();
    res.json({ school: details.school });
  } catch (err) {
    res.status(500).json({ message: "Failed to update school" });
  }
};

exports.deleteSchoolType = async (req, res) => {
  try {
    const { school } = req.body;
    let details = await AcademicDetails.findOne();
    if (!details) return res.status(404).json({ message: "Details not found" });
    details.school = details.school.filter((s) => s !== school);
    await details.save();
    res.json({ school: details.school });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete school" });
  }
};
