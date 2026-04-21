const jwt = require("jsonwebtoken");
const User = require("../Models/userSchema");
const asyncHandler = require("express-async-handler");
const { ApiError } = require("./errorMiddleware");

if (!process.env.JWT_SECRET) {
  console.error(`\x1b[31m%s\x1b[0m`, "❌ JWT_SECRET is not defined in .env");
  process.exit(1);
}

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, please login");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired, please login again");
    }
    throw new ApiError(401, "Invalid token, please login again");
  }

  req.user = await User.findById(decoded.id).select(
    "_id fullName email role phone avatar isGoogleUser passwordChangedAt",
  );

  if (!req.user) {
    throw new ApiError(401, "User no longer exists");
  }

  if (req.user.passwordChangedAt) {
    const changedAt = Math.floor(req.user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedAt) {
      throw new ApiError(401, "Password changed. Please login again.");
    }
  }

  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  throw new ApiError(403, "Access Denied: Admin only");
};

module.exports = { protect, admin };
