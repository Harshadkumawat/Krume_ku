const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
} = require("../Controllers/paymentController");
const { protect } = require("../Middleware/authMiddleware");

// ------------------------------------------------------------------
// 🚀 RAZORPAY ROUTES
// ------------------------------------------------------------------

router.post("/create-order", protect, createRazorpayOrder);

router.post("/verify", protect, verifyRazorpayPayment);

router.post("/webhook", razorpayWebhook);

module.exports = router;
