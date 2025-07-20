const express = require("express");
const router = express.Router();
const {
  getAcademicDetails,
  addCourse,
  updateCourse,
  deleteCourse,
  addYearLevel,
  updateYearLevel,
  deleteYearLevel,
  addSchool,
  updateSchool,
  deleteSchool,
} = require("../controllers/academic-details");

// Get all academic details
router.get("/academic-details", getAcademicDetails);

// Course endpoints
router.post("/courses", addCourse);
router.put("/courses", updateCourse);
router.delete("/courses", deleteCourse);

// Year level endpoints
router.post("/year-levels", addYearLevel);
router.put("/year-levels", updateYearLevel);
router.delete("/year-levels", deleteYearLevel);

// School endpoints
router.post("/schools", addSchool);
router.put("/schools", updateSchool);
router.delete("/schools", deleteSchool);

module.exports = router;
