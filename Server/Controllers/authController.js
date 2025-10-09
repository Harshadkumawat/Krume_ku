
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/userSchema");

const TOKEN_TTL_MIN = 15;
const SALT_ROUNDS = 10; 

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: `${TOKEN_TTL_MIN}m` });

const buildCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: TOKEN_TTL_MIN * 60 * 1000,
  };
};

const safeUser = (u) => ({
  _id: u._id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone,
  role: u.role,
  memberSince: u.createdAt,
});

const normEmail = (e) => (e ? String(e).trim().toLowerCase() : undefined);
const normPhone = (p) => (p ? String(p).replace(/\s+/g, "") : undefined);

// 🟢 Registration 
const registration = asyncHandler(async (req, res) => {
  let { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !phone || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the details" });
  }

  email = normEmail(email);
  phone = normPhone(phone);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({
      fullName: String(fullName).trim(),
      email,
      phone,
      password: hashedPassword,
      role: "user", 
    });

    const token = genToken(user._id);
    res.cookie("token", token, buildCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: safeUser(user),
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }
    return res
      .status(400)
      .json({ success: false, message: "Invalid user data" });
  }
});

// 🟢 Login
const login = asyncHandler(async (req, res) => {
  let { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email or phone and password",
    });
  }

  email = normEmail(email);
  phone = normPhone(phone);

  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select(
    "_id password fullName email phone role createdAt"
  );

  if (!user) {
    return res
      .status(400)
      .json({
        success: false,
        message: "User not found, please register first",
      });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = genToken(user._id);
  res.cookie("token", token, buildCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: safeUser(user),
  });
});

// 🟢 Logout
const logout = asyncHandler(async (req, res) => {
  const opts = buildCookieOptions();
  res.clearCookie("token", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
});

// 🟢 Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select("_id fullName email phone role createdAt")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: safeUser(user) });
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

module.exports = { registration, login, logout, getCurrentUser };
