const User = require("../Models/userSchema");
const Product = require("../Models/ProductSchema");
const asyncHandler = require("express-async-handler");
const { ApiError } = require("../Middleware/errorMiddleware");
const calculatePricing = require("../Utils/calculatePricing");

const WISHLIST_SELECT =
  "productName price discountPercent discountPrice finalPriceWithTax images slug inStock countInStock colors sizes category subCategory";

// ── Add to Wishlist ──────────────────────────────────────────
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const productExists = await Product.findById(productId).select("_id").lean();
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },
    { new: true },
  );

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({
    success: true,
    message: "Added to Wishlist",
    data: user.wishlist,
  });
});

// ── Remove from Wishlist ─────────────────────────────────────
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true },
  );

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({
    success: true,
    message: "Removed from Wishlist",
    data: user.wishlist,
  });
});

// ── Get My Wishlist ──────────────────────────────────────────
const getMyWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    select: WISHLIST_SELECT,
  });

  if (!user) throw new ApiError(404, "User not found");

  const wishlistWithPricing = user.wishlist
    .filter((item) => item != null)
    .map((item) => {
      const product = item.toObject ? item.toObject() : item;
      return {
        ...product,
        pricing: calculatePricing(product),
      };
    });

  res.status(200).json({ success: true, data: wishlistWithPricing });
});

module.exports = { addToWishlist, removeFromWishlist, getMyWishlist };
