const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    public_id: {
      type: String,
      required: true, // cloudinary cleanup ke liye (update/delete pe)
    },
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    ctaText: { type: String, trim: true, default: "Shop Now" },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Linked product is required"],
    },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);
