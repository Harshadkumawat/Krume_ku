const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
  },

  discountPercent: {
    type: Number,
    default: 0,
  },

  finalPrice: {
    type: Number,
    required: true,
  },

  gstPercent: {
    type: Number,
    default: 12, 
  },

  gstAmount: {
    type: Number,
    required: true,
  },

  finalPriceWithTax: {
    type: Number,
    required: true,
  },

  sizes: [
    {
      label: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
        required: true,
      },
      stock: {
        type: Number,
        default: 0,
      },
    },
  ],

  colors: {
    type: [String],
    required: true,
  },

  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],

  gender: {
    type: String,
    enum: ["Men", "Women", "Unisex", "Kids"],
    required: true,
  },

  category: {
    type: String,
    enum: ["T-Shirts", "Shirts", "Trousers", "Kurta", "Jacket", "Sweater", "Jeans", "Ethnic Wear"],
    required: true,
  },

  subCategory: {
    type: String,
    enum: ["Printed", "Plain", "Oversized", "Embroidered", "Graphic", "Casual", "Formal"],
    required: true,
  },

  season: {
    type: String,
    enum: ["Summer", "Winter", "All Season"],
    required: true,
  },

  inStock: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
