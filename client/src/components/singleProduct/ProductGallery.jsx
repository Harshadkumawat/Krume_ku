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
      {/* 🖼️ Grid View (Snitch Style) */}
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
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center touch-none overflow-hidden"
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-8 z-[220] p-3 bg-zinc-100 hover:bg-zinc-200 text-black rounded-full transition-all"
            >
              <X size={24} />
            </button>

            {images.length > 1 && zoomLevel === 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx(
                      (p) => (p - 1 + images.length) % images.length,
                    );
                  }}
                  className="absolute left-2 md:left-8 z-[210] p-3 text-black hover:bg-zinc-100 rounded-full transition-all hidden sm:block"
                >
                  <ChevronLeft size={36} strokeWidth={1} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((p) => (p + 1) % images.length);
                  }}
                  className="absolute right-2 md:right-8 z-[210] p-3 text-black hover:bg-zinc-100 rounded-full transition-all hidden sm:block"
                >
                  <ChevronRight size={36} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                key={activeImageIdx}
                src={cldSrc(images[activeImageIdx], 1600)}
                className={`max-w-full max-h-full object-contain select-none ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: zoomLevel }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                drag={zoomLevel > 1 ? true : "y"}
                dragConstraints={
                  zoomLevel > 1
                    ? { top: -400, bottom: 400, left: -400, right: 400 }
                    : { top: 0, bottom: 0 }
                }
                onDragEnd={(e, { offset }) => {
                  if (zoomLevel === 1 && (offset.y > 100 || offset.y < -100))
                    setIsGalleryOpen(false);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((p) => (p === 1 ? 2.5 : 1));
                }}
              />
            </motion.div>

            {/* Mobile swipe helper */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-400 text-xs font-medium sm:hidden z-[210] pointer-events-none">
              Double tap to zoom • Swipe down to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </>
  );
}
