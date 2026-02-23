const express = require("express");
const {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../Controllers/wishlistController");
const { protect } = require("../Middleware/authMiddleware");
const router = express.Router();

router.get("/", protect, getMyWishlist);
router.post("/add", protect, addToWishlist);
router.put("/remove", protect, removeFromWishlist);

module.exports = router;
