const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/userSchema");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const buildCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  };
};

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  memberSince: user.createdAt,
});

const registration = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the details" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user data" });
  }

  const token = genToken(user._id);
  const cookieOptions = buildCookieOptions();
  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: safeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email or phone and password",
    });
  }

  const user = email
    ? await User.findOne({ email })
    : await User.findOne({ phone });
  if (!user)
    return res.status(400).json({
      success: false,
      message: "User not found, please register first",
    });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });

  const token = genToken(user._id);
  const cookieOptions = buildCookieOptions();
  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: safeUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  const cookieOptions = buildCookieOptions();

  res.clearCookie("token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: safeUser(user) });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

module.exports = { registration, login, logout, getCurrentUser };
