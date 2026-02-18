const asyncHandler = require("express-async-handler");
const Product = require("../Models/ProductSchema");
const Order = require("../Models/orderModel");
const User = require("../Models/userSchema");
const calculatePricing = require("../Utils/calculatePricing");
const uploadBufferToCloudinary = require("../Utils/uploadToCloudinary");
const { cloudinary } = require("../Utils/cloudinary");

// -------------------- 1. GET ALL PRODUCTS (Dashboard Table) --------------------
exports.getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// -------------------- 2. CREATE PRODUCT (Integrated with fabricCare) --------------------
exports.createProductFast = asyncHandler(async (req, res) => {
  const {
    productName,
    description,
    price,
    discountPercent = 0,
    gender,
    category,
    subCategory,
    season,
    fabricCare, // 🔥 Captured from body
    isFeatured = false,
  } = req.body;

  let { sizes, colors } = req.body;

  // JSON Parsing for Arrays
  try {
    if (typeof sizes === "string") sizes = JSON.parse(sizes);
    if (typeof colors === "string") colors = JSON.parse(colors);
  } catch (err) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid JSON format for sizes/colors",
      });
  }

  // Validation
  if (
    !productName ||
    !price ||
    !gender ||
    !category ||
    !subCategory ||
    !season
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "At least one image is required" });
  }

  // Image Upload
  const uploaded = await Promise.all(
    req.files.map((f) =>
      uploadBufferToCloudinary(f.buffer, "krumeku/products"),
    ),
  );
  const images = uploaded.map((u) => ({
    url: u.secure_url,
    public_id: u.public_id,
  }));

  // Pricing Logic Calculation
  const pricing = calculatePricing({
    price: Number(price),
    discountPercent: Number(discountPercent) || 0,
  });

  const product = await Product.create({
    user: req.user._id,
    productName: String(productName).trim(),
    description: description ?? "",
    fabricCare: fabricCare ?? "", // 🔥 Saving fabricCare to DB
    price: Number(price),
    discountPercent: Number(discountPercent) || 0,
    ...pricing,
    sizes: sizes || [],
    colors: colors || [],
    images,
    gender,
    category,
    subCategory,
    season,
    isFeatured: String(isFeatured) === "true",
  });

  return res.status(201).json({ success: true, data: product });
});

// -------------------- 3. UPDATE PRODUCT (Integrated with fabricCare) --------------------
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  const {
    productName,
    description,
    price,
    discountPercent,
    gender,
    category,
    subCategory,
    season,
    fabricCare, // 🔥 Captured for update
    isFeatured,
  } = req.body;

  let { sizes, colors, imagesToDelete } = req.body;

  try {
    if (sizes && typeof sizes === "string") sizes = JSON.parse(sizes);
    if (colors && typeof colors === "string") colors = JSON.parse(colors);
    if (imagesToDelete && typeof imagesToDelete === "string")
      imagesToDelete = JSON.parse(imagesToDelete);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid format in update" });
  }

  // Direct Updates
  if (productName) product.productName = productName;
  if (description) product.description = description;
  if (fabricCare !== undefined) product.fabricCare = fabricCare; // 🔥 Updating fabricCare
  if (gender) product.gender = gender;
  if (category) product.category = category;
  if (subCategory) product.subCategory = subCategory;
  if (season) product.season = season;
  if (isFeatured !== undefined)
    product.isFeatured = String(isFeatured) === "true";
  if (sizes) product.sizes = sizes;
  if (colors) product.colors = colors;

  // Recalculate Pricing if price/discount changed
  if (price !== undefined || discountPercent !== undefined) {
    const newPrice = price !== undefined ? Number(price) : product.price;
    const newDiscount =
      discountPercent !== undefined
        ? Number(discountPercent)
        : product.discountPercent;

    const pricing = calculatePricing({
      price: newPrice,
      discountPercent: newDiscount,
    });

    product.price = newPrice;
    product.discountPercent = newDiscount;
    product.discountPrice = pricing.discountPrice;
    product.gstAmount = pricing.gstAmount;
    product.finalPriceWithTax = pricing.finalPriceWithTax;
    product.discountAmount = pricing.discountAmount;
  }

  // Handle Image Deletion
  if (imagesToDelete?.length > 0) {
    await Promise.all(
      imagesToDelete.map((id) => cloudinary.uploader.destroy(id)),
    );
    product.images = product.images.filter(
      (img) => !imagesToDelete.includes(img.public_id),
    );
  }

  // Handle New Image Uploads
  if (req.files?.length > 0) {
    const uploaded = await Promise.all(
      req.files.map((f) =>
        uploadBufferToCloudinary(f.buffer, "krumeku/products"),
      ),
    );
    product.images = [
      ...product.images,
      ...uploaded.map((u) => ({ url: u.secure_url, public_id: u.public_id })),
    ];
  }

  await product.save();
  res.status(200).json({ success: true, data: product });
});

// -------------------- 4. DELETE PRODUCT --------------------
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  if (product.images?.length > 0) {
    await Promise.allSettled(
      product.images.map((img) => cloudinary.uploader.destroy(img.public_id)),
    );
  }

  await product.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
});

// -------------------- 5. DASHBOARD STATS --------------------
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { range = "daily" } = req.query;

  const [totalProducts, totalUsers, totalOrders] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
  ]);

  // Inventory Value (MRP * Stock)
  const inventoryValue = await Product.aggregate([
    {
      $project: {
        productValue: {
          $multiply: ["$price", { $sum: { $ifNull: ["$sizes.stock", 0] } }],
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$productValue" } } },
  ]);
  const totalInventoryValue =
    inventoryValue.length > 0 ? inventoryValue[0].total : 0;

  // Total Revenue
  const sales = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalSales = sales.length > 0 ? sales[0].total : 0;

  // Recent Orders
  const latestOrders = await Order.find()
    .populate("user", "fullName email avatar")
    .sort({ createdAt: -1 })
    .limit(6);

  // Graph Data
  let groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  if (range === "monthly") {
    groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const lowStockProducts = await Product.find({ "sizes.stock": { $lte: 5 } });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalUsers,
      totalOrders,
      totalSales,
      totalInventoryValue,
      latestOrders,
      salesData,
      lowStockProducts,
    },
  });
});
