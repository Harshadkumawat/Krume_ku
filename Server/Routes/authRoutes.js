const express = require("express");
const router = express.Router();
const { protect, admin } = require("../Middleware/authMiddleware");
const {
  registration,
  login,
  googleAuth,
  logout,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  getAdminUserStats,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");

router.post("/register", registration);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/me", protect, getCurrentUser);
router.put("/update-profile", protect, updateProfile);

router.get("/admin/users", protect, admin, getAllUsers);
router.get("/admin/user-stats", protect, admin, getAdminUserStats);

module.exports = router;
