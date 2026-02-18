const express = require("express");
const router = express.Router();


const { protect } = require("../Middleware/authMiddleware");

const { 
  addToWishlist, 
  removeFromWishlist, 
  getMyWishlist 
} = require("../Controllers/wishlistController");


router.use(protect);

// --- Wishlist Endpoints ---
router.get("/", getMyWishlist);           
router.post("/add", addToWishlist);       
router.put("/remove", removeFromWishlist); 

module.exports = router;