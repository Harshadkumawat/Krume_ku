const Coupon = require("../Models/couponModel");
const Cart = require("../Models/CartSchema");
const asyncHandler = require("express-async-handler");
const { calculateBill } = require("../Utils/cartCalculator");

// ============================================================
// 1. APPLY COUPON (Modified for Persistence & Sync)
// ============================================================
exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  // 1. Cart aur Coupon fetch karo
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    res.status(400);
    throw new Error("Invalid Coupon Code");
  }

  // 2. Bill Calculate karo (Validation ke liye)
  const billDetails = calculateBill(cart.items, coupon);

  // 🔥 STRICT CHECK: Numbers compare karo (Fixes 999 limit bug)
  const subtotal = Number(billDetails.cartTotalExclTax);
  const minRequired = Number(coupon.minOrderAmount);

  if (subtotal < minRequired) {
    const diff = minRequired - subtotal; // 🔥 Kitna balance kam hai
    res.status(400);
    throw new Error(
      `Is coupon ke liye ₹${diff} ki shopping aur karein. (Min Order: ₹${minRequired})`,
    );
  }

  // 🔥 PERSISTENCE: Database mein coupon save karo
  // Isse refresh karne par bhi coupon laga rahega
  cart.appliedCoupon = coupon._id;
  await cart.save();

  // 3. Consistency Response (Same as getCart structure)
  res.status(200).json({
    success: true,
    message: "Coupon Applied!",
    data: {
      appliedCoupon: coupon,
      billDetails: {
        ...billDetails,

        minOrderLimit: coupon.minOrderAmount,
      },
    },
  });
});

// ============================================================
// 2. REMOVE COUPON (New - Industry Standard)
// ============================================================
exports.removeCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (cart) {
    cart.appliedCoupon = null; // Database se hatao
    await cart.save();
  }

  const billDetails = calculateBill(cart.items, null);

  res.status(200).json({
    success: true,
    message: "Coupon Removed",
    data: {
      appliedCoupon: null,
      billDetails,
    },
  });
});

// ============================================================
// 1. CREATE COUPON (Admin Only)
// ============================================================
exports.createCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Check if coupon with same code exists
  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// ============================================================
// 3. GET ALL COUPONS (Admin Only)
// ============================================================
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, coupons });
});

// ============================================================
// 4. DELETE COUPON (Admin Only)
// ============================================================
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "Coupon deleted" });
});

// ============================================================
// 5. UPDATE COUPON STATUS (Admin Only - Toggle Active/Inactive)
// ============================================================
exports.updateCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.status(200).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  // Jo fields body mein aayi hain unhe update karo
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  res.status(200).json({ success: true, coupon: updatedCoupon });
});
