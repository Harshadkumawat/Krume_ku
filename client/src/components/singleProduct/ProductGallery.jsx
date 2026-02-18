import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

// 🔥 Robust Image Loader
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dftticvtc";

const cldSrc = (img, width = 800) => {
  if (!img) return "https://via.placeholder.com/800x1000?text=No+Image";
  if (typeof img === "string") return img;
  if (img.public_id) {
    // 'c_pad' ensures image fits within dimensions without cropping (maintains aspect ratio)
    return `https://res.cloudinary.com/${CLOUD}/image/upload/c_pad,w_${width},h_${Math.floor(width * 1.25)},q_auto,f_auto,b_white/${img.public_id}`;
  }
  return (
    img.secure_url ||
    img.url ||
    "https://via.placeholder.com/800x1000?text=Error"
  );
};

export default function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure images array is valid
  const allImages =
    Array.isArray(images) && images.length > 0
      ? images
      : [{ url: "https://via.placeholder.com/800x1000?text=No+Image" }];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  // Navigate function
  const paginate = (newDirection) => {
    const nextIndex =
      (activeIndex + newDirection + allImages.length) % allImages.length;
    setActiveIndex(nextIndex);
  };

  return (
    <div className="lg:col-span-7 flex flex-col gap-6 select-none">
      {/* ==============================================
          1. MAIN VIEW (The Trigger)
      ============================================== */}
      <div className="relative aspect-[3/4] lg:aspect-[4/5] w-full bg-zinc-50 rounded-[2rem] border border-zinc-100 overflow-hidden group">
        {/* Animated Image Container */}
        <div
          className="w-full h-full flex items-center justify-center p-4 lg:p-8 cursor-zoom-in"
          onClick={() => setIsExpanded(true)}
        >
          <motion.img
            key={activeIndex} // Change key to trigger animation on index change
            layoutId={`product-image-${activeIndex}`} // 🔥 The Magic ID linking simple view to modal
            src={cldSrc(allImages[activeIndex], 1000)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full object-contain drop-shadow-sm"
            alt="Product Preview"
          />
        </div>

        {/* Floating Page Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 shadow-sm z-10 pointer-events-none">
          {allImages.map((_, idx) => (
            <motion.div
              key={idx}
              className={`rounded-full transition-colors duration-300 ${
                activeIndex === idx ? "bg-black" : "bg-black/20"
              }`}
              animate={{
                width: activeIndex === idx ? 24 : 6,
                height: 6,
              }}
            />
          ))}
        </div>

        {/* Expand Icon */}
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 z-20"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* ==============================================
          2. THUMBNAILS (Film Strip)
      ============================================== */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              activeIndex === idx
                ? "border-black scale-95 shadow-md ring-1 ring-black/10"
                : "border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
            }`}
          >
            <img
              src={cldSrc(img, 200)}
              className="w-full h-full object-cover"
              alt="thumb"
            />
            {activeIndex === idx && (
              <motion.div
                layoutId="active-ring"
                className="absolute inset-0 bg-black/5"
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ==============================================
          3. IMMERSIVE MODAL (The Liquid Experience)
      ============================================== */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[200] bg-white/95 flex items-center justify-center"
          >
            {/* --- Controls --- */}
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 z-[220] p-4 bg-black/5 hover:bg-black text-black hover:text-white rounded-full transition-all active:scale-90"
            >
              <X size={24} />
            </button>

            {/* Prev Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              className="absolute left-4 lg:left-12 z-[210] p-4 hover:bg-black/5 rounded-full transition-all active:scale-90 hidden md:block"
            >
              <ChevronLeft size={40} strokeWidth={1.5} />
            </button>

            {/* Next Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              className="absolute right-4 lg:right-12 z-[210] p-4 hover:bg-black/5 rounded-full transition-all active:scale-90 hidden md:block"
            >
              <ChevronRight size={40} strokeWidth={1.5} />
            </button>

            {/* --- Draggable Image Container --- */}
            <motion.div
              className="relative w-full h-full max-w-[95vw] max-h-[90vh] flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2} // Elastic feel like rubber band
              onDragEnd={(e, { offset, velocity }) => {
                // Agar user ne jaldi se flick kiya ya dur tak drag kiya -> Close
                if (offset.y > 150 || velocity.y > 200) {
                  setIsExpanded(false);
                }
              }}
            >
              <motion.img
                key={activeIndex}
                layoutId={`product-image-${activeIndex}`} // 🔥 Matches the ID in main view for seamless morph
                src={cldSrc(allImages[activeIndex], 1600)} // High Res
                className="max-w-full max-h-full object-contain drop-shadow-2xl select-none pointer-events-none"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }} // Shrink back
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            </motion.div>

            {/* Hint / Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 pointer-events-none"
            >
              <span className="w-1 h-4 bg-zinc-300 rounded-full animate-bounce" />
              Swipe down to close
            </motion.div>

            {/* Mobile Click Navigation Overlay (Invisible) */}
            <div className="absolute inset-0 z-[205] md:hidden flex">
              <div
                className="w-1/3 h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
              />
              <div className="w-1/3 h-full" /> {/* Center area for drag */}
              <div
                className="w-1/3 h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
