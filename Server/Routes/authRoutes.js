const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
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
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} = require("../Controllers/authController");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public Auth Routes ──────────────────────────────────────
router.post("/register", authLimiter, registration);
router.post("/login", authLimiter, login);
router.post("/google-auth", authLimiter, googleAuth);

// ── Password Reset (Rate Limited) ──────────────────────────
router.post("/forgot-password", authLimiter, forgotPassword);
router.patch("/reset-password/:token", authLimiter, resetPassword);

// ── Protected Routes (Logged-in Users) ─────────────────────
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.put("/update-profile", protect, updateProfile);

// ── Address Management (Protected) ─────────────────────────
router.post("/address", protect, addUserAddress);
router.put("/address/:id", protect, updateUserAddress);
router.delete("/address/:id", protect, deleteUserAddress);

// ── Admin Routes ────────────────────────────────────────────
router.get("/admin/users", protect, admin, getAllUsers);
router.get("/admin/user-stats", protect, admin, getAdminUserStats);

module.exports = router;
