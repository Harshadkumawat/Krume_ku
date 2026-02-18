const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // % off ya flat ₹ off
      default: "percentage",
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0, // Kitne ki shopping pe apply hoga
    },
    usageLimit: {
      type: Number, // Total kitne users use kar sakte hain (e.g. First 100 users)
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0, // Kitni baar use ho chuka hai
    },
    usersUsed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Ek user ek hi baar use kare isliye ID save karenge
      },
    ],
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coupon", couponSchema);
