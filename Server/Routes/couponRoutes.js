const express = require("express");
const router = express.Router();
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

// ── User Routes (Login Required) ─────────────────────
router.post("/apply", protect, applyCoupon);
router.post("/remove", protect, removeCoupon);

// ── Admin Routes ─────────────────────────────────────
router.use(protect, admin);

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.put("/status/:id", updateCouponStatus); // ✅ Specific pehle
router.put("/:id", updateCoupon); // ✅ Dynamic baad mein
router.delete("/:id", deleteCoupon);

module.exports = router;
