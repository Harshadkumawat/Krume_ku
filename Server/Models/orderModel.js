const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    orderItems: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        size: { type: String, default: "M" },
        color: { type: String, default: "Standard" },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      addressType: { type: String, default: "Home" },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "Online"],
      default: "COD",
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    // ── Pricing ────────────────────────────────────────
    itemsPrice: { type: Number, required: true, default: 0, min: 0 },
    taxPrice: { type: Number, required: true, default: 0, min: 0 },
    shippingPrice: { type: Number, required: true, default: 0, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },

    appliedCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    // ── Payment Status ─────────────────────────────────
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    // ── Delivery Status ────────────────────────────────
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    orderStatus: {
      type: String,
      required: true,
      default: "Processing",
      enum: [
        "Processing",
        "Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Return Approved",
        "Returned",
      ],
    },

    // ── Return Info ────────────────────────────────────
    returnInfo: {
      isReturnRequested: { type: Boolean, default: false },
      reason: { type: String },
      comments: { type: String },
      type: { type: String, enum: ["Refund", "Exchange"] },
      status: {
        type: String,
        default: "None",
        enum: ["None", "Pending", "Approved", "Rejected", "Refunded"],
      },
      requestedAt: { type: Date },
      shiprocketReturnId: { type: String },
      adminComment: { type: String },
    },

    // ── Tracking ───────────────────────────────────────
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
  },
  { timestamps: true },
);

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
