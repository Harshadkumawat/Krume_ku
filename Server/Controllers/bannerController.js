const asyncHandler = require("express-async-handler");
const Banner = require("../Models/Banner");
const uploadBufferToCloudinary = require("../Utils/uploadToCloudinary");
const { cloudinary } = require("../Utils/cloudinary");
const { ApiError } = require("../Middleware/errorMiddleware");

// ── PUBLIC — Home page ke liye sirf active banners ───────────
exports.getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate("product", "slug _id productName images")
    .lean();

  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// ── ADMIN — sab banners (active + inactive), management page ke liye ─
exports.getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({})
    .sort({ order: 1, createdAt: -1 })
    .populate("product", "slug _id productName images")
    .lean();

  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// ── ADMIN — naya banner create ────────────────────────────────
exports.createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, ctaText, product, order = 0 } = req.body;

  if (!product) throw new ApiError(400, "Linked product is required");
  if (!req.file) throw new ApiError(400, "Banner image is required");

  const uploaded = await uploadBufferToCloudinary(
    req.file.buffer,
    "krumeku/banners",
  );

  const banner = await Banner.create({
    image: uploaded.secure_url,
    public_id: uploaded.public_id, // update/delete pe cloudinary cleanup ke liye
    title: title || "",
    subtitle: subtitle || "",
    ctaText: ctaText || "Shop Now",
    product,
    order: Number(order),
  });

  const populated = await banner.populate(
    "product",
    "slug _id productName images",
  );

  res.status(201).json({ success: true, data: populated });
});

// ── ADMIN — update banner (image optional, isActive toggle bhi isi se) ─
exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");

  const { title, subtitle, ctaText, product, order, isActive } = req.body;
  const oldPublicId = banner.public_id;

  // naya image aaya to upload karo, purani ka public_id yaad rakho cleanup ke liye
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(
      req.file.buffer,
      "krumeku/banners",
    );
    banner.image = uploaded.secure_url;
    banner.public_id = uploaded.public_id;
  }

  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (ctaText !== undefined) banner.ctaText = ctaText;
  if (product !== undefined) banner.product = product;
  if (order !== undefined) banner.order = Number(order);
  if (isActive !== undefined) banner.isActive = String(isActive) === "true";

  await banner.save();

  // purani image cloudinary se hatao (sirf jab image replace hui ho)
  if (req.file && oldPublicId) {
    cloudinary.uploader.destroy(oldPublicId).catch((err) => {
      console.error(
        `⚠️ Cloudinary cleanup failed for ${oldPublicId}:`,
        err.message,
      );
    });
  }

  const populated = await banner.populate(
    "product",
    "slug _id productName images",
  );
  res.status(200).json({ success: true, data: populated });
});

// ── ADMIN — delete banner ──────────────────────────────────────
exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");

  await banner.deleteOne();

  if (banner.public_id) {
    cloudinary.uploader.destroy(banner.public_id).catch((err) => {
      console.error(
        `⚠️ Cloudinary cleanup failed for ${banner.public_id}:`,
        err.message,
      );
    });
  }

  res.status(200).json({ success: true, message: "Banner deleted" });
});
