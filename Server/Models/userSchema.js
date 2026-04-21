const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      minLength: [6, "Password should be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please enter a valid 10-digit Indian phone number",
      },
    },
    uid: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: {
      type: [
        {
          fullName: { type: String, trim: true },
          phone: { type: String, trim: true },
          address: { type: String, trim: true },
          landmark: { type: String, trim: true },
          city: { type: String, trim: true },
          state: { type: String, trim: true },
          pincode: { type: String, trim: true },
          country: { type: String, default: "India" },
          addressType: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
          },
          isDefault: { type: Boolean, default: false },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 addresses allowed",
      },
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: {
      type: Date,
      index: { expires: 0 },
    },
    // ✅ FIX: Password change tracking — JWT invalidation ke liye
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Password Hashing (Pre-save Hook)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password Compare Method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Reset Password Token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// Ensure Single Default Address (Pre-save)
userSchema.pre("save", function (next) {
  if (this.isModified("addresses") && this.addresses.length > 0) {
    const defaults = this.addresses.filter((a) => a.isDefault);

    if (defaults.length > 1) {
      this.addresses.forEach((a) => (a.isDefault = false));
      this.addresses[this.addresses.length - 1].isDefault = true;
    }

    if (defaults.length === 0 && this.addresses.length > 0) {
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
