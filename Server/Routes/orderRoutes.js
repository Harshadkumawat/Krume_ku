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
  handleReturnStatus,
  requestReturn,
} = require("../Controllers/orderController");

// ── ADMIN ROUTES ─────────────────────────────────────────────
router.get("/admin/all", protect, admin, getAllOrders);

// ── USER ROUTES ──────────────────────────────────────────────
router.route("/").post(protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);

// ── ID-BASED ROUTES ──────────────────────────────────────────
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, requestReturn);
router.put("/:id/return/manage", protect, admin, handleReturnStatus);

router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, admin, updateOrderStatus)
  .delete(protect, admin, deleteOrder);

module.exports = router;
