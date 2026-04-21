const { cloudinary } = require("./cloudinary");
const streamifier = require("streamifier");

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error("No file buffer provided."));

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "krumeku/uploads",
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        timeout: 30000, 
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadBufferToCloudinary;
