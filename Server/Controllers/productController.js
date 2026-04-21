const asyncHandler = require("express-async-handler");
const Product = require("../Models/ProductSchema");
const { ApiError } = require("../Middleware/errorMiddleware");
const calculatePricing = require("../Utils/calculatePricing");

// ── Helpers ─────────────────────────────────────────────────

const attachPricing = (list) =>
  list.map((p) => ({
    ...p,
    pricing: {
      originalPrice: p.price,
      discountPercent: p.discountPercent || 0,
      discountAmount: p.discountAmount || 0,
      discountPrice: p.discountPrice || p.price,
      gstRate: p.gstRate || 0,
      gstAmount: p.gstAmount || 0,
      basePrice: p.discountPrice || p.price,
      finalPriceWithTax: p.finalPriceWithTax || p.price,
    },
  }));

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const inFilter = (param) => {
  if (!param) return null;
  const values = param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!values.length) return null;
  return { $in: values.map((v) => new RegExp(`^${escapeRegex(v)}$`, "i")) };
};

const LIST_PROJECTION = {
  productName: 1,
  price: 1,
  discountPercent: 1,
  discountAmount: 1,
  discountPrice: 1,
  gstRate: 1,
  gstAmount: 1,
  finalPriceWithTax: 1,
  images: { $slice: 2 },
  category: 1,
  subCategory: 1,
  gender: 1,
  sizes: 1,
  colors: 1,
  slug: 1,
  inStock: 1,
  countInStock: 1,
  isFeatured: 1,
  isNewArrival: 1,
};

const SORT_OPTIONS = {
  newest: { inStock: -1, createdAt: -1 },
  price: { inStock: -1, price: 1 },
  "-price": { inStock: -1, price: -1 },
  popular: { inStock: -1, soldCount: -1 },
  createdAt: { inStock: -1, createdAt: 1 },
  "-createdAt": { inStock: -1, createdAt: -1 },
};

// ── GET /api/products ───────────────────────────────────────
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
    newArrival,
    cats,
    sizes,
    colors,
  } = req.query;

  page = Math.max(1, Number(page));
  limit = Math.min(50, Math.max(1, Number(limit)));

  const filter = {};

  if (q) {
    const escapedQ = escapeRegex(q);
    filter.$or = [
      { productName: { $regex: escapedQ, $options: "i" } },
      { category: { $regex: escapedQ, $options: "i" } },
      { subCategory: { $regex: escapedQ, $options: "i" } },
    ];
  }

  const catsFilter = inFilter(cats);
  if (catsFilter) {
    filter.category = catsFilter;
  } else if (category) {
    filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
  }

  if (subCategory) {
    filter.subCategory = {
      $regex: `^${escapeRegex(subCategory)}$`,
      $options: "i",
    };
  }
  if (gender) {
    filter.gender = { $regex: `^${escapeRegex(gender)}$`, $options: "i" };
  }

  const sizesFilter = inFilter(sizes);
  if (sizesFilter) filter["sizes.label"] = sizesFilter;

  const colorsFilter = inFilter(colors);
  if (colorsFilter) filter.colors = colorsFilter;

  if (newArrival === "true") filter.isNewArrival = true;

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);
  if (Number.isFinite(parsedMin) || Number.isFinite(parsedMax)) {
    filter.price = {};
    if (Number.isFinite(parsedMin)) filter.price.$gte = parsedMin;
    if (Number.isFinite(parsedMax)) filter.price.$lte = parsedMax;
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  const skip = (page - 1) * limit;

  const [total, rawData] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter, LIST_PROJECTION)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const data = attachPricing(rawData);

  res.status(200).json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasMore: total > skip + data.length,
    },
  });
});

// ── GET /api/products/:id ──────────────────────────────────
exports.getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = { $or: [{ slug: id }] };

  if (/^[a-f\d]{24}$/i.test(id)) {
    query.$or.push({ _id: id });
  }

  const product = await Product.findOne(query).lean();
  if (!product) throw new ApiError(404, "Product not found");

  product.pricing = {
    originalPrice: product.price,
    discountPercent: product.discountPercent || 0,
    discountAmount: product.discountAmount || 0,
    discountPrice: product.discountPrice || product.price,
    gstRate: product.gstRate || 0,
    gstAmount: product.gstAmount || 0,
    basePrice: product.discountPrice || product.price,
    finalPriceWithTax: product.finalPriceWithTax || product.price,
  };

  const relatedRaw = await Product.find({
    category: product.category,
    gender: product.gender,
    _id: { $ne: product._id },
    inStock: true,
  })
    .limit(4)
    .select(LIST_PROJECTION)
    .lean();

  res.status(200).json({
    success: true,
    data: product,
    related: attachPricing(relatedRaw),
  });
});

// ── GET /api/products/home ─────────────────────────────────
exports.getHomeProducts = asyncHandler(async (req, res) => {
  const select =
    "productName price discountPercent discountAmount discountPrice gstRate gstAmount finalPriceWithTax images category subCategory isFeatured isNewArrival soldCount slug countInStock inStock colors sizes";

  const stockFilter = { inStock: true };

  const [newArrivalsRaw, featuredRaw, hotDealsRaw, premiumRaw, categoryStats] =
    await Promise.all([
      Product.find({ ...stockFilter, isNewArrival: true })
        .sort({ createdAt: -1 })
        .limit(8)
        .select(select)
        .lean(),
      Product.find({ ...stockFilter, isFeatured: true })
        .limit(8)
        .select(select)
        .lean(),
      Product.find({ ...stockFilter, discountPercent: { $gt: 20 } })
        .sort({ discountPercent: -1 })
        .limit(8)
        .select(select)
        .lean(),
      Product.find(stockFilter)
        .sort({ soldCount: -1 })
        .limit(4)
        .select(select)
        .lean(),
      Product.aggregate([
        { $match: stockFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

  res.status(200).json({
    success: true,
    data: {
      newArrivals: attachPricing(newArrivalsRaw),
      featuredProducts: attachPricing(featuredRaw),
      hotDeals: attachPricing(hotDealsRaw),
      premiumCollection: attachPricing(premiumRaw),
      categorySummary: categoryStats,
    },
  });
});

// ── POST /api/products/fix-db ──────────────────────────────
exports.fixProductData = asyncHandler(async (req, res) => {
  const products = await Product.find({}).lean();
  const bulkOps = products.map((product) => {
    const currentStock = (product.sizes || []).reduce(
      (sum, item) => sum + (Number(item.stock) || 0),
      0,
    );
    const pricing = calculatePricing(product);

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            countInStock: currentStock,
            inStock: currentStock > 0,
            discountAmount: pricing.discountAmount,
            discountPrice: pricing.discountPrice,
            gstRate: pricing.gstRate,
            gstAmount: pricing.gstAmount,
            finalPriceWithTax: pricing.finalPriceWithTax,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) await Product.bulkWrite(bulkOps);

  res.json({
    success: true,
    message: `Fixed ${bulkOps.length} products.`,
  });
});
