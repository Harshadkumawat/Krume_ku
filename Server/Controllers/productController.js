const asyncHandler = require("express-async-handler");
const Product = require("../Models/ProductSchema");
const mongoose = require("mongoose");
const calculatePricing = require("../Utils/calculatePricing");

// 1. GET ALL PRODUCTS (Shop Page)
exports.getProducts = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 12,
    q,
    category,
    subCategory,
    gender,
    sort,
    minPrice,
    maxPrice,
  } = req.query;

  page = Math.max(1, Number(page));
  limit = Math.min(50, Math.max(1, Number(limit)));

  const filter = {};

  if (q) {
    filter.$or = [
      { productName: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { subCategory: { $regex: q, $options: "i" } },
      { fabricCare: { $regex: q, $options: "i" } },
    ];
  }

  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (gender) filter.gender = { $regex: `^${gender}$`, $options: "i" };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // 🔥 SORT: Available items first (inStock: -1)
  const sortOptions = {
    price: { inStock: -1, price: 1 },
    "-price": { inStock: -1, price: -1 },
    createdAt: { inStock: -1, createdAt: 1 },
    "-createdAt": { inStock: -1, createdAt: -1 },
  };
  const sortBy = sortOptions[sort] || { inStock: -1, createdAt: -1 };

  const skip = (page - 1) * limit;

  const projection = {
    productName: 1,
    price: 1,
    discountPercent: 1,
    images: { $slice: 1 },
    category: 1,
    gender: 1,
    sizes: 1,
    colors: 1,
    slug: 1,
    inStock: 1,
    countInStock: 1,
  };

  const [total, rawData] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter, projection)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const data = rawData.map((product) => ({
    ...product,
    pricing: calculatePricing(product),
  }));

  res.status(200).json({
    success: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

// 2. GET SINGLE PRODUCT
exports.getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let product;

  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).lean();
  } else {
    product = await Product.findOne({ slug: id }).lean();
  }

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product Not Found" });
  }

  product.pricing = calculatePricing(product);

  const relatedRaw = await Product.aggregate([
    {
      $match: {
        category: product.category,
        gender: product.gender,
        _id: { $ne: product._id },
        inStock: true,
      },
    },
    { $sample: { size: 4 } },
    {
      $project: {
        productName: 1,
        price: 1,
        images: { $arrayElemAt: ["$images", 0] },
        discountPercent: 1,
        slug: 1,
        inStock: 1,
        countInStock: 1,
      },
    },
  ]);

  const related = relatedRaw.map((p) => ({
    ...p,
    pricing: calculatePricing(p),
  }));

  res.status(200).json({ success: true, data: product, related });
});

// 3. GET HOME SCREEN DATA
exports.getHomeProducts = asyncHandler(async (req, res) => {
  const fetchOptions =
    "productName price images category isFeatured discountPercent slug countInStock inStock";

  // 🔥 Home Page Filter: Only show In-Stock items
  const stockFilter = { inStock: true };

  const [newArrivalsRaw, featuredRaw, hotDealsRaw, premiumRaw] =
    await Promise.all([
      Product.find(stockFilter)
        .sort({ createdAt: -1 })
        .limit(8)
        .select(fetchOptions)
        .lean(),
      Product.find({ ...stockFilter, isFeatured: true })
        .limit(8)
        .select(fetchOptions)
        .lean(),
      Product.find({ ...stockFilter, discountPercent: { $gt: 20 } })
        .sort({ discountPercent: -1 })
        .limit(8)
        .select(fetchOptions)
        .lean(),
      Product.find(stockFilter)
        .sort({ price: -1 })
        .limit(4)
        .select(fetchOptions)
        .lean(),
    ]);

  const attachPricing = (list) =>
    list.map((p) => ({ ...p, pricing: calculatePricing(p) }));

  res.status(200).json({
    success: true,
    data: {
      newArrivals: attachPricing(newArrivalsRaw),
      featuredProducts: attachPricing(featuredRaw),
      hotDeals: attachPricing(hotDealsRaw),
      premiumCollection: attachPricing(premiumRaw),
    },
  });
});

// 4. DATABASE FIX TOOL (Run this once)
exports.fixProductData = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  let count = 0;

  for (const product of products) {
    // Recalculate Stock
    if (product.sizes && product.sizes.length > 0) {
      product.countInStock = product.sizes.reduce(
        (total, item) => total + (Number(item.stock) || 0),
        0,
      );
    }

    // Update Boolean
    product.inStock = product.countInStock > 0;

    // Fix Slugs
    if (!product.slug) {
      product.slug = product.productName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    await product.save();
    count++;
  }
  res.json({ success: true, message: `Fixed data for ${count} products` });
});
