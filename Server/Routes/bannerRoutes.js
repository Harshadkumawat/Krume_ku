const express = require("express");
const router = express.Router();

const upload = require("../Utils/multer");
const { protect, admin } = require("../Middleware/authMiddleware");

const {
  getActiveBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../Controllers/bannerController");

// --- Public: Homepage ke liye active banners ---
router.get("/", getActiveBanners);

// --- Admin: sab banners (active + inactive) management page ke liye ---
router.get("/admin", protect, admin, getAdminBanners);

// --- Admin: naya banner create (ek image) ---
router.post("/", upload.single("image"), createBanner);

// --- Admin: banner update (image optional, isActive toggle bhi isi se) ---
router.put("/:id", protect, admin, upload.single("image"), updateBanner);

// --- Admin: banner delete ---
router.delete("/:id", protect, admin, deleteBanner);

module.exports = router;
