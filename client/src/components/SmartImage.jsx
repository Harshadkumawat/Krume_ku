import React, { useState, useMemo } from "react";
import { Image as ImageIcon } from "lucide-react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";

export default function SmartImage({
  src,
  width = 300,
  height,
  alt = "Product image",
  className = "",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 🛠️ URL Generator: Isse useMemo me rakha hai taaki har render pe calculation na ho
  const finalSrc = useMemo(() => {
    if (!src) return null;

    // CASE 1: Agar 'src' ek Object hai (MongoDB Cloudinary Object)
    if (typeof src === "object") {
      if (src.public_id) {
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},c_limit/${src.public_id}`;
      }
      return src.url || src.secure_url || null;
    }

    // CASE 2: Agar 'src' ek String hai
    if (typeof src === "string") {
      // Cloudinary URL Optimization logic
      if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
        if (!src.includes("f_auto")) {
          return src.replace(
            "/upload/",
            `/upload/f_auto,q_auto,w_${width},c_limit/`,
          );
        }
      }
      return src;
    }

    return null;
  }, [src, width]);

  // ❌ Error ya Empty state ke liye safe fallback
  if (hasError || !finalSrc) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{ height: height || "100%", minHeight: "100px" }}
      >
        <ImageIcon size={width > 100 ? 24 : 16} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100/50 ${className}`}>
      {/* ✨ Subtle Pulse Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}

      {/* 🚀 Optimized Image Component */}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      />
    </div>
  );
}
