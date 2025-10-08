const express = require("express");
const {
  registration,
  login,
  logout,
  getCurrentUser,
} = require("../Controllers/authController");

const router = express.Router();

router.post("/register", registration);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

module.exports = router;
