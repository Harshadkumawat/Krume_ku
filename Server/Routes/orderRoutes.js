const express = require("express");
const router = express.Router();
const { protect, admin } = require("../Middleware/authMiddleware");

const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  getAdminDashboardStats,
  handleReturnStatus,
  requestReturn,
} = require("../Controllers/orderController");

// --- 1. ADMIN ROUTES ---

router.get("/admin/stats", protect, admin, getAdminDashboardStats);
router.get("/admin/all", protect, admin, getAllOrders);

// --- 2. USER ROUTES ---

router.route("/").post(protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.put("/:id/cancel", protect, cancelOrder);

// --- 3. ID BASED ROUTES ---
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, admin, updateOrderStatus)
  .delete(protect, admin, deleteOrder);

router.put("/:id/return", protect, requestReturn);
router.put("/:id/return/manage", protect, admin, handleReturnStatus);

module.exports = router;
