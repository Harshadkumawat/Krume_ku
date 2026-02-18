const express = require("express");
const { checkPincode } = require("../Controllers/shippingController");
const router = express.Router();

router.get("/check/:pincode", checkPincode);

module.exports = router;
