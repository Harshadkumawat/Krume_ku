import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";

const cldSrc = (img, width = 800) => {
  if (!img) return "https://via.placeholder.com/800x1000?text=No+Image";
  if (typeof img === "string") return img;
  if (img.public_id)
    return `https://res.cloudinary.com/${CLOUD}/image/upload/c_pad,w_${width},q_auto,f_auto,b_white/${img.public_id}`;
  return (
    img.secure_url ||
    img.url ||
    "https://via.placeholder.com/800x1000?text=Error"
  );
};

export default function ProductGallery({ images = [], productName }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (isGalleryOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  const openHDGallery = (idx) => {
    setActiveImageIdx(idx);
    setIsGalleryOpen(true);
    setZoomLevel(1);
  };

  if (!images.length) return null;

  return (
    <>
      {/* 🖼️ Grid View */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-2 lg:gap-4 snap-x snap-mandatory no-scrollbar pb-4 lg:pb-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => openHDGallery(idx)}
            className="relative w-[85vw] sm:w-[60vw] lg:w-full shrink-0 snap-center aspect-[3/4] bg-zinc-50 cursor-zoom-in group overflow-hidden rounded-md lg:rounded-xl"
          >
            <img
              src={cldSrc(img, 800)}
              alt={`${productName} view ${idx + 1}`}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>
        ))}
      </div>

      {/* 🌌 HD Full Screen Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center touch-none overflow-hidden"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-8 z-[220] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            >
              <X size={24} />
            </button>

            {/* Desktop Navigation Buttons */}
            {images.length > 1 && zoomLevel === 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx(
                      (p) => (p - 1 + images.length) % images.length,
                    );
                  }}
                  className="absolute left-2 md:left-8 z-[210] p-3 text-white hover:bg-white/10 rounded-full transition-all hidden sm:block"
                >
                  <ChevronLeft size={36} strokeWidth={1} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((p) => (p + 1) % images.length);
                  }}
                  className="absolute right-2 md:right-8 z-[210] p-3 text-white hover:bg-white/10 rounded-full transition-all hidden sm:block"
                >
                  <ChevronRight size={36} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div className="relative w-full h-full flex items-center justify-center">
              {/* 👇 YAHAN MAGIC HAI: AnimatePresence mode="wait" lagaya */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIdx}
                  src={cldSrc(images[activeImageIdx], 1600)}
                  // 👇 absolute lagaya taaki layout jhatka na khaye
                  className={`absolute max-w-full max-h-full object-contain select-none ${
                    zoomLevel > 1
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-default"
                  }`}
                  initial={{ opacity: 0, scale: 0.95, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: zoomLevel,
                    x: zoomLevel === 1 ? 0 : undefined,
                    y: zoomLevel === 1 ? 0 : undefined,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.15 },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={true}
                  dragConstraints={
                    zoomLevel > 1
                      ? { top: -400, bottom: 400, left: -400, right: 400 }
                      : { top: 0, bottom: 0, left: 0, right: 0 }
                  }
                  // 👇 Rubber-band effect swipe ke liye
                  dragElastic={zoomLevel === 1 ? 0.8 : 0.1}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (zoomLevel === 1) {
                      const isHorizontal =
                        Math.abs(offset.x) > Math.abs(offset.y);
                      // 👇 Velocity check: Halka sa fast swipe karne par bhi change hoga
                      const swipePower = Math.abs(offset.x) * velocity.x;

                      if (isHorizontal) {
                        if (offset.x < -50 || swipePower < -10000) {
                          setActiveImageIdx((p) => (p + 1) % images.length);
                        } else if (offset.x > 50 || swipePower > 10000) {
                          setActiveImageIdx(
                            (p) => (p - 1 + images.length) % images.length,
                          );
                        }
                      } else {
                        if (offset.y > 100 || offset.y < -100) {
                          setIsGalleryOpen(false);
                        }
                      }
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel((p) => (p === 1 ? 2.5 : 1));
                  }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Mobile swipe helper */}
            <div className="absolute bottom-10 left-0 w-full text-center text-zinc-400 text-xs font-medium sm:hidden z-[210] pointer-events-none px-4">
              Double tap to zoom • Swipe left/right • Swipe down to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </>
  );
}
