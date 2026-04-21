const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../Models/userSchema");
const { ApiError } = require("../Middleware/errorMiddleware");
const sendWelcomeEmail = require("../Utils/sendWelcomeEmail");
const sendResetEmail = require("../Utils/Emails/sendResetEmail");

// ─── Constants ──────────────────────────────────────────────
const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const MAX_ADDRESSES = 10;

const ADDRESS_FIELDS = [
  "fullName",
  "phone",
  "address",
  "landmark",
  "city",
  "state",
  "pincode",
  "country",
  "addressType",
  "isDefault",
];

// ─── Helpers ────────────────────────────────────────────────
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  res
    .status(statusCode)
    .cookie("token", token, { ...getCookieOptions(), maxAge: COOKIE_MAX_AGE })
    .json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isGoogleUser: user.isGoogleUser,
        addresses: user.addresses || [],
        memberSince: user.createdAt,
      },
    });
};

const setOnlyDefault = (addresses, targetId) => {
  addresses.forEach((addr) => {
    addr.isDefault = String(addr._id) === String(targetId);
  });
};

// ─── Authentication ─────────────────────────────────────────

const googleAuth = asyncHandler(async (req, res) => {
  const { fullName, email, avatar, uid } = req.body;

  if (!email || !uid) {
    throw new ApiError(400, "Email and UID are required");
  }

  let user = await User.findOne({ email });

  if (user) {
    if (!user.isGoogleUser) {
      user.isGoogleUser = true;
      user.uid = uid;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    } else if (user.uid && user.uid !== uid) {
      throw new ApiError(
        400,
        "This email is already linked to a different Google account",
      );
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
    } catch (_) {
      // Non-blocking
    }
  }

  sendTokenResponse(user, 200, res);
});

const registration = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const emailExists = await User.findOne({
    email: email.toLowerCase().trim(),
  }).lean();
  if (emailExists) {
    throw new ApiError(400, "This email is already registered");
  }

  if (phone?.trim()) {
    const phoneExists = await User.findOne({ phone: phone.trim() }).lean();
    if (phoneExists) {
      throw new ApiError(400, "This phone number is already registered");
    }
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || undefined,
    password,
  });

  try {
    await sendWelcomeEmail(user.email, user.fullName);
  } catch (_) {
    // Non-blocking
  }

  sendTokenResponse(user, 201, res);
});

const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    throw new ApiError(400, "Please provide credentials");
  }

  const query = email
    ? { email: email.toLowerCase().trim() }
    : { phone: phone.trim() };

  const user = await User.findOne(query).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isGoogleUser && !user.password) {
    throw new ApiError(
      400,
      "This account uses Google Sign-In. Please login with Google.",
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  sendTokenResponse(user, 200, res);
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", getCookieOptions());
  res.status(200).json({ success: true, message: "Session Terminated" });
});

// ─── Password Management ───────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    throw new ApiError(400, "Email is required");
  }

  const GENERIC_MSG = "If this email is registered, a reset link has been sent";

  const user = await User.findOne({
    email: req.body.email.toLowerCase().trim(),
  });

  if (!user || (user.isGoogleUser && !user.password)) {
    return res.status(200).json({ success: true, message: GENERIC_MSG });
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);
    res.status(200).json({ success: true, message: GENERIC_MSG });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Email send failed. Please try again.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  if (!req.body.password || req.body.password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = req.body.password;
  user.passwordChangedAt = new Date();
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// ─── Profile Management ────────────────────────────────────

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -resetPasswordToken -resetPasswordExpire -__v")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (req.body.phone?.trim() && req.body.phone.trim() !== user.phone) {
    const phoneExists = await User.findOne({
      phone: req.body.phone.trim(),
      _id: { $ne: req.user._id },
    });
    if (phoneExists) {
      throw new ApiError(400, "This phone number is already in use");
    }
    user.phone = req.body.phone.trim();
  }

  if (req.body.fullName?.trim()) {
    user.fullName = req.body.fullName.trim();
  }

  const updatedUser = await user.save();

  const userData = updatedUser.toObject();
  delete userData.password;
  delete userData.resetPasswordToken;
  delete userData.resetPasswordExpire;

  res.status(200).json({ success: true, data: userData });
});

// ─── Address Management ────────────────────────────────────

const addUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.addresses.length >= MAX_ADDRESSES) {
    throw new ApiError(400, `Maximum ${MAX_ADDRESSES} addresses allowed`);
  }

  const isFirstAddress = user.addresses.length === 0;

  if (!isFirstAddress && req.body.isDefault === true) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {};
  ADDRESS_FIELDS.forEach((key) => {
    if (req.body[key] !== undefined) {
      newAddress[key] = req.body[key];
    }
  });
  newAddress.isDefault = isFirstAddress || req.body.isDefault === true;

  user.addresses.push(newAddress);
  await user.save();

  res.status(200).json({ success: true, data: user.addresses });
});

const updateUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(req.params.id);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (req.body.isDefault === true) {
    setOnlyDefault(user.addresses, req.params.id);
  }

  ADDRESS_FIELDS.forEach((key) => {
    if (req.body[key] !== undefined) address[key] = req.body[key];
  });

  await user.save();
  res.status(200).json({ success: true, data: user.addresses });
});

const deleteUserAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const addressToDelete = user.addresses.id(req.params.id);
  if (!addressToDelete) {
    throw new ApiError(404, "Address not found");
  }

  const wasDefault = addressToDelete.isDefault;
  user.addresses.pull({ _id: req.params.id });

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.status(200).json({ success: true, data: user.addresses });
});

// ─── Admin Endpoints ───────────────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password -resetPasswordToken -resetPasswordExpire -__v")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, count: users.length, data: users });
});

const getAdminUserStats = asyncHandler(async (req, res) => {
  const [total, google, latest] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isGoogleUser: true }),
    User.find({})
      .select("-password -resetPasswordToken -resetPasswordExpire -__v")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: { totalUsers: total, googleUsers: google, latestUsers: latest },
  });
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
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
