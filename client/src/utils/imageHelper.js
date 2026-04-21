// src/utils/imageHelper.js

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";

/**
 
 * @param {string|object} img -
 * @param {number} width -
 * @param {string} crop - 
 */
export const cldImage = (img, width = 600, crop = "fill") => {
  if (!img)
    return `https://placehold.co/${width}x${width}/000000/FFFFFF?text=No+Image`;

  let publicId = null;

  if (typeof img === "object") {
    if (img.public_id) {
      publicId = img.public_id;
    } else {
      return (
        img.secure_url ||
        img.url ||
        `https://placehold.co/${width}x${width}/000000/FFFFFF?text=Error`
      );
    }
  }

  if (typeof img === "string") {
    if (img.startsWith("http")) {
      if (img.includes("res.cloudinary.com") && !img.includes("f_auto")) {
        return img.replace(
          "/upload/",
          `/upload/c_${crop},w_${width},q_auto,f_auto/`,
        );
      }
      return img;
    }
    publicId = img;
  }

  if (publicId) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_${crop},g_auto,w_${width},q_auto,f_auto/${publicId}`;
  }

  return `https://placehold.co/${width}x${width}/000000/FFFFFF?text=No+Image`;
};
