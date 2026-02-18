const express = require("express");
const router = express.Router();

const upload = require("../Utils/multer");
const { protect, admin } = require("../Middleware/authMiddleware");

const {
  createProductFast,
  getAdminProducts,
  deleteProduct,
  updateProduct,
  getDashboardStats,
} = require("../Controllers/adminController");

// --- Dashboard Stats ---
router.get("/stats", protect, admin, getDashboardStats);

// --- Product Management ---

// 1. Create New Product
router.post(
  "/products",
  protect,
  admin,
  upload.array("images", 8),
  createProductFast,
);

// 2. Get Admin Product List
router.get("/products", protect, admin, getAdminProducts);

// 3. Delete Product
router.delete("/products/:id", protect, admin, deleteProduct);

// 4. Update Product
router.put(
  "/products/:id",
  protect,
  admin,
  upload.array("images", 8),
  updateProduct,
);

module.exports = router;
