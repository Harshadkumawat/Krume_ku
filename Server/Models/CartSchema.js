const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
            min: [1, "Quantity must be at least 1"],
            max: [10, "Maximum 10 per item allowed"],
          },
          size: { type: String, required: true, trim: true },
          color: { type: String, required: true, trim: true },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length <= 50;
        },
        message: "Cart cannot have more than 50 items",
      },
    },
    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },
  { timestamps: true },
);

cartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
