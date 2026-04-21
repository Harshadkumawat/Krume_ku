const cloudinary = require("cloudinary").v2;

const requiredKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`\x1b[33m%s\x1b[0m`, `⚠️  Missing env var: ${key}`);
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const verifyCloudinary = async () => {
  try {
    await cloudinary.api.ping();
    console.log(
      `\x1b[32m%s\x1b[0m`,
      "☁️  Cloudinary Strategy: Online & Verified",
    );
  } catch (error) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      "❌ Cloudinary Connection Failed. Check .env keys.",
    );
  }
};

verifyCloudinary();

module.exports = { cloudinary };
