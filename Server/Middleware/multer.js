const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({});


const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"), false);
  }
  cb(null, true);
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,          
    
  },
});

module.exports = upload;
