const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxLength: [20, "Coupon code cannot exceed 20 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
      validate: {
        validator: function (val) {
          if (this.discountType === "percentage" && val > 100) return false;
          return true;
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: [0, "Maximum discount amount cannot be negative"],
    },
    usageLimit: {
      type: Number,
      required: [true, "Usage limit is required"],
      min: [1, "Usage limit must be at least 1"],
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/**
 * Helper method to validate coupon eligibility
 */
couponSchema.methods.isValid = function (userId, orderAmount) {
  if (this.expiresAt < new Date()) {
    return { valid: false, message: "Coupon has expired" };
  }
  if (!this.isActive) {
    return { valid: false, message: "Coupon is not active" };
  }
  if (this.usedBy.length >= this.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached" };
  }
  if (userId && this.usedBy.some((id) => id.toString() === userId.toString())) {
    return { valid: false, message: "You have already used this coupon" };
  }
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order ₹${this.minOrderAmount} required`,
    };
  }
  return { valid: true };
};

couponSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
