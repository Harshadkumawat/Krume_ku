const asyncHandler = require("express-async-handler");
const Cart = require("../Models/CartSchema");
const Coupon = require("../Models/couponModel");
const Product = require("../Models/ProductSchema");
const { ApiError } = require("../Middleware/errorMiddleware");
const { calculateBill } = require("../Utils/cartCalculator");
const calculatePricing = require("../Utils/calculatePricing");

const PRODUCT_SELECT =
  "productName price discountPercent discountPrice discountAmount gstRate gstAmount finalPriceWithTax images category subCategory colors sizes countInStock inStock";

const MAX_ITEM_QTY = 10;

// ── Helpers ──────────────────────────────────────────────────

const buildItemsWithPricing = (items) =>
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

const buildCartResponse = (cart) => {
  const items = buildItemsWithPricing(cart.items);
  const billDetails = calculateBill(cart.items, cart.appliedCoupon);

  return {
    items,
    billDetails,
    appliedCoupon: cart.appliedCoupon || null,
  };
};

const revalidateCoupon = async (cart) => {
  if (!cart.appliedCoupon) return false;

  let coupon = cart.appliedCoupon;
  if (typeof coupon !== "object" || !coupon.discountValue) {
    coupon = await Coupon.findById(cart.appliedCoupon);
  }

  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
    cart.appliedCoupon = null;
    return true;
  }

  const bill = calculateBill(cart.items);
  if (Number(bill.cartTotalExclTax) < Number(coupon.minOrderAmount || 0)) {
    cart.appliedCoupon = null;
    return true;
  }

  return false;
};

const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId })
    .populate({ path: "items.product", select: PRODUCT_SELECT })
    .populate("appliedCoupon");
};

// ── Controllers ──────────────────────────────────────────────

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, size, color, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (!productId || !size || !color) {
    throw new ApiError(400, "Product ID, size, and color are required");
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ITEM_QTY) {
    throw new ApiError(400, `Quantity must be between 1 and ${MAX_ITEM_QTY}`);
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (!product.inStock || product.countInStock < qty) {
    throw new ApiError(
      400,
      !product.inStock
        ? "Out of stock"
        : `Only ${product.countInStock} units left`,
    );
  }

  let cart = await getPopulatedCart(userId);

  if (!cart) {
    await Cart.create({
      user: userId,
      items: [{ product: productId, size, color, quantity: qty }],
    });
    cart = await getPopulatedCart(userId);
  } else {
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product?._id?.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;

      if (newQty > MAX_ITEM_QTY) {
        throw new ApiError(
          400,
          `Maximum ${MAX_ITEM_QTY} units per item allowed`,
        );
      }
      if (newQty > product.countInStock) {
        throw new ApiError(400, `Only ${product.countInStock} units available`);
      }

      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, size, color, quantity: qty });
    }

    await revalidateCoupon(cart);
    await cart.save();
    cart = await getPopulatedCart(userId);
  }

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    data: buildCartResponse(cart),
  });
});

exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await getPopulatedCart(userId);

  if (!cart || cart.items.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        items: [],
        billDetails: {
          totalItems: 0,
          cartTotalExclTax: 0,
          discountAmount: 0,
          gstAmount: 0,
          shipping: 0,
          finalTotal: 0,
        },
        appliedCoupon: null,
      },
    });
  }

  cart.items = cart.items.filter((item) => item.product != null);
  const wasRemoved = await revalidateCoupon(cart);
  if (wasRemoved) await cart.save();

  res.status(200).json({
    success: true,
    data: buildCartResponse(cart),
  });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId, action, size } = req.body;
  const userId = req.user._id;

  const cart = await getPopulatedCart(userId);
  if (!cart) throw new ApiError(404, "Cart not found");

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId,
  );
  if (itemIndex === -1) throw new ApiError(404, "Item not found");

  const cartItem = cart.items[itemIndex];
  const product = cartItem.product;

  if (action === "inc") {
    // ✅ FIX 2: Check BOTH max limit AND stock
    if (cartItem.quantity >= MAX_ITEM_QTY) {
      throw new ApiError(400, `Maximum ${MAX_ITEM_QTY} units per item allowed`);
    }
    if (cartItem.quantity >= (product?.countInStock ?? Infinity)) {
      throw new ApiError(400, "Maximum stock reached");
    }
    cartItem.quantity += 1;
  } else if (action === "dec") {
    if (cartItem.quantity > 1) cartItem.quantity -= 1;
  } else if (action === "updateSize" && size) {
    cartItem.size = size;
  }

  const wasRemoved = await revalidateCoupon(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: wasRemoved ? "Cart updated & coupon removed" : "Cart updated",
    data: buildCartResponse(cart),
    couponRemoved: wasRemoved,
  });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  const cart = await getPopulatedCart(userId);
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  const wasRemoved = await revalidateCoupon(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    data: buildCartResponse(cart),
    couponRemoved: wasRemoved,
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ success: true, message: "Cart cleared" });
});
