const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // ✅ FIX: Multer error → errorMiddleware handle karega
    const error = new Error(
      "Invalid file type. Only JPG, PNG, and WEBP are allowed!",
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2MB
  },
});

module.exports = upload;
