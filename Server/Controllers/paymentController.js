const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const Cart = require("../Models/CartSchema");
const { calculateBill } = require("../Utils/cartCalculator");
const { ApiError } = require("../Middleware/errorMiddleware");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    `\x1b[31m%s\x1b[0m`,
    "❌ CRITICAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env",
  );
}

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}

const PRODUCT_SELECT =
  "productName price discountPercent discountPrice discountAmount gstRate gstAmount finalPriceWithTax images category subCategory colors sizes countInStock inStock";

// ── Create Razorpay Order ─────────────────────────────────────
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    throw new ApiError(500, "Payment service not configured");
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({ path: "items.product", select: PRODUCT_SELECT })
    .populate("appliedCoupon");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty — add items before payment");
  }

  const validItems = cart.items.filter((item) => item.product != null);
  if (validItems.length === 0) {
    throw new ApiError(
      400,
      "All products in your cart are no longer available",
    );
  }

  const billDetails = calculateBill(validItems, cart.appliedCoupon);
  const serverAmount = billDetails.finalTotal;

  if (!serverAmount || serverAmount <= 0) {
    throw new ApiError(400, "Invalid order amount");
  }

  const options = {
    amount: Math.round(serverAmount * 100), 
    currency: "INR",
    receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({ success: true, order });
});

// ── Verify Razorpay Payment ───────────────────────────────────
exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payment verification not configured");
  }

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  const isAuthentic = crypto.timingSafeEqual(
    Buffer.from(razorpay_signature),
    Buffer.from(expectedSign),
  );

  if (isAuthentic) {
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }
});
