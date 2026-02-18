const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../Models/userSchema");
const sendWelcomeEmail = require("../Utils/sendWelcomeEmail");
const sendResetEmail = require("../Utils/Emails/sendResetEmail")

const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

const buildCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
};

const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

const safeUser = (u) => ({
  _id: u._id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar: u.avatar,
  isGoogleUser: u.isGoogleUser,
  addresses: u.addresses || [],
  memberSince: u.createdAt,
});

const googleAuth = asyncHandler(async (req, res) => {
  const { fullName, email, avatar, uid } = req.body;
  let user = await User.findOne({ email });

  if (user) {
    if (!user.isGoogleUser) {
      user.isGoogleUser = true;
      user.uid = uid;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    user = await User.create({
      fullName,
      email,
      avatar,
      uid,
      isGoogleUser: true,
    });
    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (err) {
      console.error("Welcome Email Error:", err.message);
    }
  }

  res.cookie("token", genToken(user._id, user.role), buildCookieOptions());
  res.status(200).json({ success: true, data: safeUser(user) });
});

const registration = asyncHandler(async (req, res) => {
  let { fullName, email, phone, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

  if (existingUser) {
    res.status(400);
    throw new Error("Identity already exists in archive.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
  });

  try {
    await sendWelcomeEmail(user.email, user.fullName);
  } catch (err) {
    console.error("Welcome Email Error:", err.message);
  }

  res.cookie("token", genToken(user._id, user.role), buildCookieOptions());
  res.status(201).json({ success: true, data: safeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  let { email, phone, password } = req.body;
  const query = email
    ? { email: email.toLowerCase().trim() }
    : { phone: phone.trim() };
  const user = await User.findOne(query).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid access credentials.");
  }

  res.cookie("token", genToken(user._id, user.role), buildCookieOptions());
  res.status(200).json({ success: true, data: safeUser(user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("Email not found in archive.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendResetEmail(user.email, resetUrl);
    res.status(200).json({ success: true, message: "Reset link dispatched." });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500);
    throw new Error("Email could not be sent.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired security token.");
  }

  user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Access key updated successfully." });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.phone = req.body.phone || user.phone;
  if (req.body.address) user.addresses.push(req.body.address);

  const updatedUser = await user.save();
  res.status(200).json({ success: true, data: safeUser(updatedUser) });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

const getAdminUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const latestUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
  const googleUsers = await User.countDocuments({ isGoogleUser: true });

  res
    .status(200)
    .json({ success: true, data: { totalUsers, googleUsers, latestUsers } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", buildCookieOptions());
  res.status(200).json({ success: true, message: "Session Terminated" });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: safeUser(user) });
});

module.exports = {
  registration,
  login,
  logout,
  getCurrentUser,
  googleAuth,
  updateProfile,
  getAllUsers,
  getAdminUserStats,
  forgotPassword,
  resetPassword,
};
