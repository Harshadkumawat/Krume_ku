const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware"); 
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../Controllers/cartController");


router.use(protect);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCartItem); 
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;