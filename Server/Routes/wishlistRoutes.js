const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} = require("../Controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// --- Wishlist Endpoints ---
router.get("/", getMyWishlist);
router.post("/add", addToWishlist);
router.put("/remove", removeFromWishlist);

module.exports = router;
