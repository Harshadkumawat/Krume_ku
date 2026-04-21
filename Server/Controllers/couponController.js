const asyncHandler = require("express-async-handler");
const Coupon = require("../Models/couponModel");
const Cart = require("../Models/CartSchema");
const { ApiError } = require("../Middleware/errorMiddleware");
const { calculateBill } = require("../Utils/cartCalculator");
const calculatePricing = require("../Utils/calculatePricing");

const PRODUCT_SELECT =
  "productName price discountPercent discountPrice discountAmount gstRate gstAmount finalPriceWithTax images category subCategory colors sizes countInStock inStock";

const COUPON_FIELDS = [
  "code",
  "discountType",
  "discountValue",
  "minOrderAmount",
  "maxDiscountAmount",
  "expiresAt",
  "isActive",
  "usageLimit",
];

// ── Helpers ──────────────────────────────────────────────────

const pickFields = (body) =>
  COUPON_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

const buildItemsWithPricing = (items = []) =>
  items
    .filter((item) => item.product != null)
    .map((item) => {
      const prod = item.product;
      const pricing = calculatePricing(prod);
      const basePrice = pricing.discountPrice || prod.price;
      const finalPrice = pricing.finalPriceWithTax || basePrice;

      return {
        _id: item._id,
        product: prod,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        basePrice,
        finalPriceWithTax: finalPrice,
        itemTotalWithTax: finalPrice * item.quantity,
      };
    });

const buildCartResponse = (cart, coupon = null) => {
  const items = buildItemsWithPricing(cart.items);
  const billDetails = calculateBill(cart.items, coupon);

  return {
    items,
    appliedCoupon: coupon || null,
    billDetails,
  };
};

const removeCouponFromCarts = async (couponId) => {
  await Cart.updateMany(
    { appliedCoupon: couponId },
    { $set: { appliedCoupon: null } },
  );
};

// ── User Methods ─────────────────────────────────────────────

exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code?.trim()) {
    throw new ApiError(400, "Coupon code is required");
  }

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    PRODUCT_SELECT,
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(400, "Invalid or inactive coupon code");
  }

  if (cart.appliedCoupon?.toString() === coupon._id.toString()) {
    return res.status(200).json({
      success: true,
      message: "Coupon already applied",
      data: buildCartResponse(cart, coupon),
    });
  }

  const subtotal = Number(calculateBill(cart.items).cartTotalExclTax);
  const validation = coupon.isValid(userId, subtotal);

  if (!validation.valid) {
    throw new ApiError(400, validation.message);
  }

  cart.appliedCoupon = coupon._id;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon applied!",
    data: buildCartResponse(cart, coupon),
  });
});

exports.removeCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    PRODUCT_SELECT,
  );

  if (!cart) {
    return res.status(200).json({
      success: true,
      message: "Coupon removed",
      data: {
        items: [],
        appliedCoupon: null,
        billDetails: {
          totalItems: 0,
          cartTotalExclTax: 0,
          discountAmount: 0,
          gstAmount: 0,
          shipping: 0,
          finalTotal: 0,
        },
      },
    });
  }

  cart.appliedCoupon = null;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Coupon removed",
    data: buildCartResponse(cart, null),
  });
});

// ── Admin Methods ────────────────────────────────────────────

exports.createCoupon = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);

  if (!data.code?.trim()) {
    throw new ApiError(400, "Coupon code is required");
  }

  const exists = await Coupon.findOne({
    code: data.code.toUpperCase().trim(),
  }).lean();
  if (exists) throw new ApiError(400, "Coupon code already exists");

  const coupon = await Coupon.create({
    ...data,
    code: data.code.toUpperCase().trim(),
  });

  res.status(201).json({ success: true, data: coupon });
});

exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, data: coupons });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const data = pickFields(req.body);
  if (data.code) data.code = data.code.toUpperCase().trim();

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { $set: data },
    { new: true, runValidators: true },
  );

  if (!coupon) throw new ApiError(404, "Coupon not found");

  const criticalChanged =
    data.minOrderAmount !== undefined ||
    data.expiresAt !== undefined ||
    data.isActive !== undefined ||
    data.usageLimit !== undefined;

  if (criticalChanged) {
    await removeCouponFromCarts(coupon._id);
  }

  res.status(200).json({ success: true, data: coupon });
});

exports.updateCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  if (!coupon.isActive) {
    await removeCouponFromCarts(coupon._id);
  }

  res.status(200).json({ success: true, data: coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  await removeCouponFromCarts(coupon._id);

  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "Coupon deleted" });
});
