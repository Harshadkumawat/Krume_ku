import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cldImage } from "../../utils/imageHelper";

export default function ProductGallery({ images = [], productName }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loadedImages, setLoadedImages] = useState({}); // 🔥 Smooth Image Load State

  // 🔥 Lens Zoom States for Desktop Hover
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const imgRef = useRef(null);

  // 1. Lock Body Scroll
  useEffect(() => {
    document.body.style.overflow = isGalleryOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGalleryOpen]);

  // 2. 🔥 Keyboard Navigation for Desktop Users
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") setIsGalleryOpen(false);
      if (e.key === "ArrowLeft")
        setActiveImageIdx((p) => (p - 1 + images.length) % images.length);
      if (e.key === "ArrowRight")
        setActiveImageIdx((p) => (p + 1) % images.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, images.length]);

  const handleImageLoad = (idx) => {
    setLoadedImages((prev) => ({ ...prev, [idx]: true }));
  };

  const openHDGallery = useCallback((idx) => {
    setActiveImageIdx(idx);
    setIsGalleryOpen(true);
    setZoomLevel(1);
  }, []);

  // 3. 🔥 Mouse Hover Logic for Lens Zoom (Silai dekhne ke liye)
  const handleMouseMove = (e, idx) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setLensPos({ x, y });
    setHoveredIdx(idx);
    setShowLens(true);
  };

  const handleMouseLeave = () => {
    setShowLens(false);
    setHoveredIdx(null);
  };

  if (!images?.length) return null;

  return (
    <>
      <div
        className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-2 lg:gap-4 snap-x snap-mandatory no-scrollbar pb-4 lg:pb-0"
        role="region"
        aria-label="Product image gallery"
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            onClick={() => openHDGallery(idx)}
            onMouseMove={(e) => handleMouseMove(e, idx)}
            onMouseLeave={handleMouseLeave}
            className="relative w-[85vw] sm:w-[60vw] lg:w-full shrink-0 snap-center aspect-[3/4] bg-zinc-100 cursor-zoom-in group overflow-hidden rounded-md lg:rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            {/* Smooth Image Fade-In Logic */}
            {!loadedImages[idx] && (
              <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
            )}

            <img
              ref={hoveredIdx === idx ? imgRef : null}
              src={cldImage(img, 800)}
              alt={`${productName} view ${idx + 1}`}
              loading={idx === 0 ? "eager" : "lazy"}
              onLoad={() => handleImageLoad(idx)}
              className={`w-full h-full object-cover object-top transition-opacity duration-500 ${loadedImages[idx] ? "opacity-100" : "opacity-0"}`}
            />

            {/* 🔥 DESKTOP LENS ZOOM EFFECT (The Magic) */}
            {showLens && hoveredIdx === idx && (
              <div
                className="absolute inset-0 hidden lg:block pointer-events-none bg-no-repeat transition-transform"
                style={{
                  backgroundImage: `url(${cldImage(img, 1600)})`, // Using High-Res image for Zoom
                  backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                  backgroundSize: "250%", // Zoom Intensity
                  transform: "scale(1)",
                }}
              />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {/* FULLSCREEN HD GALLERY */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center touch-none overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-8 z-[220] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all outline-none"
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
                  className="absolute left-2 md:left-8 z-[210] p-3 text-white hover:bg-white/10 rounded-full transition-all hidden sm:block outline-none"
                >
                  <ChevronLeft size={36} strokeWidth={1} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((p) => (p + 1) % images.length);
                  }}
                  className="absolute right-2 md:right-8 z-[210] p-3 text-white hover:bg-white/10 rounded-full transition-all hidden sm:block outline-none"
                >
                  <ChevronRight size={36} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIdx}
                  src={cldImage(images[activeImageIdx], 1600)} // Full HD Image
                  alt={`${productName} HD`}
                  className={`absolute max-w-full max-h-full object-contain select-none ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{
                    opacity: 1,
                    scale: zoomLevel,
                    x: zoomLevel === 1 ? 0 : undefined,
                    y: zoomLevel === 1 ? 0 : undefined,
                  }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag={true}
                  dragConstraints={
                    zoomLevel > 1
                      ? { top: -400, bottom: 400, left: -400, right: 400 }
                      : { top: 0, bottom: 0, left: 0, right: 0 }
                  }
                  dragElastic={zoomLevel === 1 ? 0.8 : 0.1}
                  onDragEnd={(e, { offset, velocity }) => {
                    if (zoomLevel === 1) {
                      const isHorizontal =
                        Math.abs(offset.x) > Math.abs(offset.y);
                      const swipePower = Math.abs(offset.x) * velocity.x;

                      if (isHorizontal) {
                        if (offset.x < -50 || swipePower < -10000)
                          setActiveImageIdx((p) => (p + 1) % images.length);
                        else if (offset.x > 50 || swipePower > 10000)
                          setActiveImageIdx(
                            (p) => (p - 1 + images.length) % images.length,
                          );
                      } else {
                        if (offset.y > 100 || offset.y < -100)
                          setIsGalleryOpen(false);
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

            <div className="absolute bottom-10 left-0 w-full text-center text-zinc-400 text-xs font-medium sm:hidden z-[210] pointer-events-none px-4">
              Double tap to zoom • Swipe left/right • Swipe down to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
