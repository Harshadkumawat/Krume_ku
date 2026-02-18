const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, index: true },
    description: { type: String, trim: true },
    fabricCare: { type: String, default: "" },
    price: { type: Number, required: true, index: true },
    discountPercent: { type: Number, default: 0 },

    // Calculated Fields
    discountPrice: { type: Number },
    gstRate: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    finalPriceWithTax: { type: Number },
    discountAmount: { type: Number, default: 0 },

    sizes: [
      {
        label: { type: String, required: true },
        stock: { type: Number, default: 0 },
      },
    ],

    // 🔥 Correct Field Name
    countInStock: { type: Number, default: 0 },

    colors: { type: [String], required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "T-Shirts",
        "Shirts",
        "Trousers",
        "Kurta",
        "Jacket",
        "Sweater",
        "Jeans",
        "Ethnic Wear",
      ],
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      enum: [
        "Printed",
        "Plain",
        "Oversized",
        "Embroidered",
        "Graphic",
        "Casual",
        "Formal",
      ],
      required: true,
      index: true,
    },
    season: {
      type: String,
      enum: ["Summer", "Winter", "All Season"],
      required: true,
    },

    inStock: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

// Text Index for Search
ProductSchema.index({
  productName: "text",
  description: "text",
  category: "text",
  subCategory: "text",
});

// Auto-calculate Stock & Slug before saving
ProductSchema.pre("save", function (next) {
  if (this.sizes && this.sizes.length > 0) {
    this.countInStock = this.sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0,
    );
    this.inStock = this.countInStock > 0;
  }

  if (this.isModified("productName")) {
    this.slug = this.productName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
