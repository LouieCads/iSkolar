const express = require("express");
const router = express.Router();
// const authMiddleware = require("../middleware/auth");
const userController = require("../controllers/user-management");

// All routes require admin authentication
// router.use(authMiddleware);

// List all users
router.get("/users", userController.getAllUsers);
// Add user
router.post("/users", userController.addUser);
// Edit user
router.put("/users/:id", userController.updateUser);
// Delete user
router.delete("/users/:id", userController.deleteUser);
// Suspend/unsuspend user
router.patch("/users/:id/suspend", userController.suspendUser);
// Assign role
router.patch("/users/:id/role", userController.assignRole);
// Assign status
router.patch("/users/:id/status", userController.assignStatus);
// Assign verification
router.patch("/users/:id/verification", userController.assignVerification);

module.exports = router;
