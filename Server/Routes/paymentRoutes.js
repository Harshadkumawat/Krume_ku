const express = require("express");
const router = express.Router();

 
const { createRazorpayOrder, verifyRazorpayPayment } = require("../Controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// ------------------------------------------------------------------
// 🚀 RAZORPAY ROUTES
// ------------------------------------------------------------------


router.post("/create-order", protect, createRazorpayOrder);


router.post("/verify", protect, verifyRazorpayPayment);

module.exports = router;