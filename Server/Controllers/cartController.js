const asyncHandler = require("express-async-handler");
const Cart = require("../Models/CartSchema");
const Coupon = require("../Models/couponModel");
const Product = require("../Models/ProductSchema");
const { calculateBill } = require("../Utils/cartCalculator");

// ------------------------------------------------------------------
// 🔥 INDUSTRY HELPER: Coupon Re-validator
// ------------------------------------------------------------------
const revalidateCoupon = async (cart) => {
  if (cart.appliedCoupon) {
    // 🔥 Coupon details fetch karna zaroori hai minOrderAmount check ke liye
    const coupon = await Coupon.findById(cart.appliedCoupon);
    const bill = calculateBill(cart.items); // Bina coupon ke base subtotal nikalो

    if (
      coupon &&
      Number(bill.cartTotalExclTax) < Number(coupon.minOrderAmount)
    ) {
      cart.appliedCoupon = null; // Limit se kam hua toh database se coupon hata do
      return true;
    }
  }
  return false;
};

// ------------------------------------------------------------------
// 1. ADD TO CART (Logic remains solid)
// ------------------------------------------------------------------
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, size, color, quantity = 1 } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  console.log("Searching for Product ID:", productId);
  if (!product) {
    console.log("❌ Product NOT found in Database!");
    res.status(404);

    throw new Error("Product not found");
  }

  if (product.inStock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.inStock} left`);
  }

  // 🔥 UPDATE: populate me fields specify kiye
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "productName price images category sizes",
  );

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, size, color, quantity }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, color, quantity });
    }
    await revalidateCoupon(cart);
    await cart.save();
  }
  res.status(200).json({ success: true, message: "Item added", cart });
});

// ------------------------------------------------------------------
// 2. GET CART
// ------------------------------------------------------------------
exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 🔥 UPDATE: populate me sizes add kiya
  const cart = await Cart.findOne({ user: userId })
    .populate(
      "items.product",
      "productName price images category sizes pricing finalPriceWithTax",
    )
    .populate("appliedCoupon");

  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { items: [], billDetails: { totalItems: 0, finalTotal: 0 } },
    });
  }

  // Filter deleted products
  cart.items = cart.items.filter((item) => item.product !== null);

  // 🔥 LIVE VALIDATION: UI ko data bhejne se pehle re-verify
  const wasRemoved = await revalidateCoupon(cart);
  if (wasRemoved) await cart.save();

  // 🔥 Final Bill: Coupon ke saath calculate karo
  const billDetails = calculateBill(cart.items, cart.appliedCoupon);

  const itemsWithPricing = cart.items.map((item) => {
    const basePrice = item.product.discountPrice || item.product.price;
    const gstRate = basePrice < 1000 ? 0.05 : 0.12;
    const finalPriceWithTax = Math.round(basePrice * (1 + gstRate));

    return {
      _id: item._id,
      product: item.product,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      finalPriceWithTax,
      itemTotalWithTax: finalPriceWithTax * item.quantity,
    };
  });

  res.status(200).json({
    success: true,
    data: { items: itemsWithPricing, billDetails },
  });
});

// ------------------------------------------------------------------
// 3. UPDATE QUANTITY
// ------------------------------------------------------------------
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId, action, size } = req.body; // 🔥 size add kiya
  const userId = req.user._id;

  // 🔥 UPDATE: populate
  const cart = await Cart.findOne({ user: userId })
    .populate(
      "items.product",
      "productName price images category sizes pricing finalPriceWithTax",
    )
    .populate("appliedCoupon");
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId,
  );
  if (itemIndex === -1)
    return res.status(404).json({ message: "Item not found" });

  if (action === "inc") {
    cart.items[itemIndex].quantity += 1;
  } else if (action === "dec" && cart.items[itemIndex].quantity > 1) {
    cart.items[itemIndex].quantity -= 1;
  } else if (action === "updateSize" && size) {
    // 🔥 Naya logic Size ke liye
    cart.items[itemIndex].size = size;
  }

  const wasRemoved = await revalidateCoupon(cart);
  await cart.save();

  const billDetails = calculateBill(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    message: wasRemoved ? "Cart updated & Coupon removed" : "Cart updated",
    data: { billDetails },
    couponRemoved: wasRemoved,
  });
});

// ------------------------------------------------------------------
// 4. REMOVE ITEM
// ------------------------------------------------------------------
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  // 🔥 UPDATE: populate
  const cart = await Cart.findOne({ user: userId })
    .populate(
      "items.product",
      "productName price images category sizes pricing finalPriceWithTax",
    )
    .populate("appliedCoupon");
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  const wasRemoved = await revalidateCoupon(cart);
  await cart.save();

  const billDetails = calculateBill(cart.items, cart.appliedCoupon);

  res.status(200).json({
    success: true,
    message: "Item removed",
    data: { billDetails },
    couponRemoved: wasRemoved,
  });
});

// ------------------------------------------------------------------
// 5. CLEAR CART (Order place hone ke baad)
// ------------------------------------------------------------------
exports.clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await Cart.findOneAndDelete({ user: userId });
  return res.status(200).json({ success: true, message: "Cart cleared" });
});
