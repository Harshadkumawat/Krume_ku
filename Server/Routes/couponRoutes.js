const express = require("express");
const router = express.Router();

// Middlewares - Naya 'admin' function import kiya
const { protect, admin } = require("../Middleware/authMiddleware");

const {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCouponStatus,
  applyCoupon,
  removeCoupon,
  updateCoupon,
} = require("../Controllers/couponController");

// ==========================================
// 🛒 USER ROUTES (Login Required)
// ==========================================
// Ye routes har logged-in user use kar sakta hai
router.post("/apply", protect, applyCoupon);
router.post("/remove", protect, removeCoupon);

// ==========================================
// 🛠️ ADMIN ROUTES (Admin Role Required)
// ==========================================
// Niche ke saare routes sirf Admin access kar payega
router.use(protect, admin);

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.delete("/:id", deleteCoupon);
router.put("/status/:id", updateCouponStatus);
router.put("/:id", updateCoupon);

module.exports = router;
