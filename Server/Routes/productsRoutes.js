const express = require("express");
const router = express.Router();

const {
  getProducts,
  getHomeProducts,
  getSingleProduct,
  fixProductData,
} = require("../Controllers/productController");
const { protect, admin } = require("../Middleware/authMiddleware");

// ── Public Routes ───────────────────────────────────
router.get("/home", getHomeProducts); // GET /api/products/home
router.get("/", getProducts); // GET /api/products
router.get("/:id", getSingleProduct); // GET /api/products/:id

// ── Admin Routes ────────────────────────────────────
router.post("/fix-data", protect, admin, fixProductData); // POST /api/products/fix-data

module.exports = router;
