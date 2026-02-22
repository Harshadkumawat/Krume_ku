const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        size: { type: String },
        color: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      state: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "COD",
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    orderStatus: {
      type: String,
      required: true,
      default: "Processing",
    },
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

    // --- 🚀 SHIPROCKET TRACKING FIELDS ---
    shiprocketOrderId: {
      type: String,
    },
    shiprocketShipmentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
