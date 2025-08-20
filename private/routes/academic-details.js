const express = require("express");
const router = express.Router();
const {
  getAcademicDetails,
  addCourse,
  updateCourse,
  deleteCourse,
  addSemester,
  updateSemester,
  deleteSemester,
  addYearLevel,
  updateYearLevel,
  deleteYearLevel,
  addSchoolType,
  updateSchoolType,
  deleteSchoolType,
} = require("../controllers/academic-details");

// Get all academic details
router.get("/academic-details", getAcademicDetails);

// Course endpoints
router.post("/courses", addCourse);
router.put("/courses", updateCourse);
router.delete("/courses", deleteCourse);

// Semester endpoints
router.post("/semesters", addSemester);
router.put("/semesters", updateSemester);
router.delete("/semesters", deleteSemester);

// Year level endpoints
router.post("/year-levels", addYearLevel);
router.put("/year-levels", updateYearLevel);
router.delete("/year-levels", deleteYearLevel);

// School Type endpoints
router.post("/school-types", addSchoolType);
router.put("/school-types", updateSchoolType);
router.delete("/school-types", deleteSchoolType);

module.exports = router;
