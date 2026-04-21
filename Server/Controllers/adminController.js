const asyncHandler = require("express-async-handler");
const Product = require("../Models/ProductSchema");
const Order = require("../Models/orderModel");
const User = require("../Models/userSchema");
const uploadBufferToCloudinary = require("../Utils/uploadToCloudinary");
const { cloudinary } = require("../Utils/cloudinary");
const { ApiError } = require("../Middleware/errorMiddleware");

const UPDATABLE_FIELDS = [
  "productName",
  "description",
  "fabricCare",
  "gender",
  "category",
  "subCategory",
  "season",
  "isFeatured",
  "isNewArrival",
];

const safeParse = (val, fallback = []) => {
  if (!val) return fallback;
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return fallback;
  }
};

const buildDateMatch = (range) => {
  const from = new Date();
  if (range === "monthly") {
    from.setMonth(from.getMonth() - 11);
    from.setDate(1);
  } else if (range === "weekly") {
    from.setDate(from.getDate() - 84);
  } else {
    from.setDate(from.getDate() - 30);
  }
  from.setHours(0, 0, 0, 0);
  return { createdAt: { $gte: from } };
};

// ── GET ALL PRODUCTS ─────────────────────────────────────────
exports.getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  res
    .status(200)
    .json({ success: true, count: products.length, data: products });
});

// ── CREATE PRODUCT ───────────────────────────────────────────
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
    fabricCare,
    isFeatured = false,
    isNewArrival = false,
    sizes,
    colors,
  } = req.body;

  if (
    !productName ||
    !price ||
    !gender ||
    !category ||
    !subCategory ||
    !season
  ) {
    throw new ApiError(400, "All core fields are required");
  }
  if (!req.files?.length)
    throw new ApiError(400, "At least one product image is required");

  const numPrice = Number(price);
  const numDiscount = Number(discountPercent);
  const parsedSizes = safeParse(sizes);
  const parsedColors = safeParse(colors);

  if (!parsedColors || parsedColors.length === 0)
    throw new ApiError(400, "At least one color is required");

  const uploadedImages = await Promise.all(
    req.files.map((f) =>
      uploadBufferToCloudinary(f.buffer, "krumeku/products"),
    ),
  );

  const images = uploadedImages.map((u) => ({
    url: u.secure_url,
    public_id: u.public_id,
  }));

  const product = await Product.create({
    user: req.user._id,
    productName: productName.trim(),
    description: description || "",
    fabricCare: fabricCare || "",
    price: numPrice,
    discountPercent: numDiscount,
    sizes: parsedSizes,
    colors: parsedColors,
    images,
    gender,
    category,
    subCategory,
    season,
    isFeatured: String(isFeatured) === "true",
    isNewArrival: String(isNewArrival) === "true",
  });

  res.status(201).json({ success: true, data: product });
});

// ── UPDATE PRODUCT ───────────────────────────────────────────
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const { imagesToDelete, sizes, colors, price, discountPercent, ...rest } =
    req.body;
  const toDelete = imagesToDelete ? safeParse(imagesToDelete) : [];

  const validDeleteIds = toDelete.filter((pid) =>
    product.images.some((img) => img.public_id === pid),
  );

  if (req.files?.length) {
    const newlyUploaded = await Promise.all(
      req.files.map((f) =>
        uploadBufferToCloudinary(f.buffer, "krumeku/products"),
      ),
    );
    product.images.push(
      ...newlyUploaded.map((u) => ({
        url: u.secure_url,
        public_id: u.public_id,
      })),
    );
  }

  if (validDeleteIds.length > 0) {
    const remainingCount = product.images.length - validDeleteIds.length;
    if (remainingCount < 1)
      throw new ApiError(400, "Product must have at least 1 image");
    product.images = product.images.filter(
      (img) => !validDeleteIds.includes(img.public_id),
    );
  }

  UPDATABLE_FIELDS.forEach((key) => {
    if (rest[key] !== undefined) product[key] = rest[key];
  });

  if (price !== undefined) product.price = Number(price);
  if (discountPercent !== undefined)
    product.discountPercent = Number(discountPercent);
  if (sizes) product.sizes = safeParse(sizes);
  if (colors) product.colors = safeParse(colors);

  await product.save();

  if (validDeleteIds.length > 0) {
    Promise.all(
      validDeleteIds.map((pid) =>
        cloudinary.uploader.destroy(pid).catch((err) => {
          console.error(
            `⚠️ Cloudinary cleanup failed for ${pid}:`,
            err.message,
          );
        }),
      ),
    );
  }

  res.status(200).json({ success: true, data: product });
});

// ── DELETE PRODUCT ───────────────────────────────────────────
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  await product.deleteOne();

  if (product.images?.length) {
    Promise.all(
      product.images.map((img) =>
        cloudinary.uploader.destroy(img.public_id).catch((err) => {
          console.error(
            `⚠️ Cloudinary cleanup failed for ${img.public_id}:`,
            err.message,
          );
        }),
      ),
    );
  }

  res.status(200).json({ success: true, message: "Product deleted" });
});

// ── GET DASHBOARD STATS ──────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { range = "daily" } = req.query;
  const dateMatch = buildDateMatch(range);

  const revenueMatch = {
    ...dateMatch,
    isPaid: true,
    orderStatus: { $nin: ["Cancelled", "Returned"] },
  };

  const groupFormat = range === "monthly" ? "%Y-%m" : "%Y-%m-%d";

  const [
    totalProducts,
    totalUsers,
    totalOrders,
    returnRequests,
    inventoryVal,
    salesVal,
    salesData,
    latestOrders,
    lowStock,
  ] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ "returnInfo.status": "Pending" }),
    Product.aggregate([
      { $unwind: "$sizes" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$sizes.stock"] } },
        },
      },
    ]),
    Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.find()
      .populate("user", "fullName email avatar")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    Product.find({ countInStock: { $lte: 5 }, inStock: true })
      .select("productName countInStock images category sizes")
      .limit(10)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalUsers,
      totalOrders,
      totalSales: salesVal[0]?.total || 0,
      totalInventoryValue: inventoryVal[0]?.total || 0,
      returnRequests,
      latestOrders,
      salesData,
      lowStockProducts: lowStock,
    },
  });
});
