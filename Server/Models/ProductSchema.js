

const mongoose = require("mongoose");
const { getGstRate } = require("../Utils/calculatePricing");

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: { type: String, trim: true },
    fabricCare: { type: String, default: "" },

    // ── Pricing (Base values — admin sets these) ───────
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },

    // ── Pricing (Calculated — pre-save hook sets these) ─
    discountAmount: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    gstRate: { type: Number, default: 5 },
    gstAmount: { type: Number, default: 0 },
    finalPriceWithTax: { type: Number, default: 0, index: true },

    // ── Inventory ──────────────────────────────────────
    sizes: [
      {
        label: { type: String, required: true, trim: true },
        stock: { type: Number, default: 0, min: 0 },
      },
    ],
    countInStock: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: true, index: true },

    // ── Attributes ─────────────────────────────────────
    colors: {
      type: [String],
      required: [true, "At least one color is required"],
    },
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
        "Hoodies",
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
        "Bleach Art",
      ],
      required: true,
      index: true,
    },
    season: {
      type: String,
      enum: ["Summer", "Winter", "All Season"],
      required: true,
    },

    // ── Flags ──────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0, min: 0 },

    // ── Relations ──────────────────────────────────────
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ── Text Index for Search ──────────────────────────────────
ProductSchema.index({
  productName: "text",
  description: "text",
  category: "text",
  subCategory: "text",
});

// ── Pre-save Hook ──────────────────────────────────────────
ProductSchema.pre("save", function (next) {
  // 1. Stock Calculation
  // ✅ FIX: Handle empty sizes array — don't leave stale values
  if (this.sizes && this.sizes.length > 0) {
    this.countInStock = this.sizes.reduce(
      (total, item) => total + (item.stock || 0),
      0,
    );
    this.inStock = this.countInStock > 0;
  } else {
    // No sizes = no stock tracking possible
    this.countInStock = 0;
    this.inStock = false;
  }

  // 2. Pricing Calculation
  if (
    this.isModified("price") ||
    this.isModified("discountPercent") ||
    this.isNew
  ) {
    const discountPercent = Math.min(
      100,
      Math.max(0, this.discountPercent || 0),
    );

    this.discountAmount = Math.round((this.price * discountPercent) / 100);
    this.discountPrice = this.price - this.discountAmount;

    this.gstRate = getGstRate(this.discountPrice);
    this.gstAmount = Math.round((this.discountPrice * this.gstRate) / 100);

    this.finalPriceWithTax = this.discountPrice + this.gstAmount;
  }

  // 3. Slug Generation
  if (this.isModified("productName") || this.isNew) {
    const baseSlug = this.productName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = this.isNew
      ? `${baseSlug}-${Date.now().toString(36)}`
      : baseSlug;
  }

  next();
});

// ── Virtual: pricing object ────────────────────────────────
ProductSchema.virtual("pricing").get(function () {
  return {
    mrp: this.price,
    discountPercent: this.discountPercent,
    discountAmount: this.discountAmount,
    discountPrice: this.discountPrice,
    gstRate: this.gstRate,
    gstAmount: this.gstAmount,
    finalPriceWithTax: this.finalPriceWithTax,
  };
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", ProductSchema);
