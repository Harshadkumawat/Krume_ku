const User = require("../Models/userSchema");
const asyncHandler = require("express-async-handler");

// ------------------------------------------------------------------
// 🟢 ADD TO WISHLIST
// ------------------------------------------------------------------
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id; 

  
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } },
    { new: true },
  );

  res
    .status(200)
    .json({
      success: true,
      message: "Added to Wishlist",
      wishlist: user.wishlist,
    });
});

// ------------------------------------------------------------------
// 🔴 REMOVE FROM WISHLIST
// ------------------------------------------------------------------
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  // $pull: Array me se nikaal dega
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true },
  );

  res
    .status(200)
    .json({
      success: true,
      message: "Removed from Wishlist",
      wishlist: user.wishlist,
    });
});

// ------------------------------------------------------------------
// 🔵 GET MY WISHLIST (Populated)
// ------------------------------------------------------------------
const getMyWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  
  const user = await User.findById(userId).populate({
    path: "wishlist",
    select: "productName price finalPriceWithTax images slug inStock", 
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  
  res.status(200).json({ success: true, data: user.wishlist });
});

module.exports = { addToWishlist, removeFromWishlist, getMyWishlist };
