const express = require("express");
const {
  getProducts,
  getHomeProducts,

  getSingleProduct,
  fixProductData,
} = require("../Controllers/productController");

const router = express.Router();

// 1. Utility Routes 

router.get("/fix-data", fixProductData);

// 2. Home Page Route 
router.get("/home", getHomeProducts);   

// 3. Shop Page (Saare Products)

router.get("/", getProducts);           

// 4. Single Product 

router.get("/:id", getSingleProduct);   

module.exports = router;