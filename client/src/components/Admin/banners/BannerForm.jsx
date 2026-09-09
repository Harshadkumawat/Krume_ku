import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ImagePlus, X, Loader2 } from "lucide-react";

import ProductSearchSelect from "./ProductSearchSelect";
import { clearBannerError, createBanner, updateBanner } from "../../../features/banners/bannerSlice";

/**
 * Props:
 *  - editingBanner: banner object if editing, null if creating new
 *  - onClose: () => void  (called after successful save, or on cancel)
 */
const BannerForm = ({ editingBanner, onClose }) => {
  const dispatch = useDispatch();
  const { isSubmitting, error } = useSelector((state) => state.banners);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(editingBanner?.image || null);
  const [title, setTitle] = useState(editingBanner?.title || "");
  const [subtitle, setSubtitle] = useState(editingBanner?.subtitle || "");
  const [ctaText, setCtaText] = useState(editingBanner?.ctaText || "Shop Now");
  const [order, setOrder] = useState(editingBanner?.order ?? 0);
  const [product, setProduct] = useState(editingBanner?.product || null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    return () => dispatch(clearBannerError());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please select an image file");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!editingBanner && !imageFile) {
      setFormError("Banner image is required");
      return;
    }
    if (!product) {
      setFormError("Select which product this banner should link to");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("ctaText", ctaText);
    formData.append("order", order);
    formData.append("product", product._id);

    let result;
    if (editingBanner) {
      result = await dispatch(
        updateBanner({ id: editingBanner._id, formData }),
      );
    } else {
      result = await dispatch(createBanner(formData));
    }

    if (!result.error) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl relative my-8">
        <div className="flex items-center justify-between px-8 py-6 border-b-2 border-zinc-100">
          <h2 className="text-xl font-black uppercase italic">
            {editingBanner ? "Edit Banner" : "New Home Banner"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-red-600 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Image upload */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
              Banner Image *{" "}
              <span className="normal-case font-medium">
                (recommended 1920×1080, landscape)
              </span>
            </label>
            <label className="relative flex items-center justify-center h-48 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:border-red-600 transition-colors overflow-hidden bg-zinc-50">
              {preview ? (
                <img
                  src={preview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <ImagePlus size={28} />
                  <span className="text-[11px] font-bold uppercase">
                    Click to upload
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Product link */}
          <ProductSearchSelect value={product} onChange={setProduct} />

          {/* Title / Subtitle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Title Line
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CUSTOM"
                className="w-full px-4 py-3 border-2 border-zinc-900 text-[12px] font-bold outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Subtitle Line
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. THREADS"
                className="w-full px-4 py-3 border-2 border-zinc-900 text-[12px] font-bold outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-4 py-3 border-2 border-zinc-900 text-[12px] font-bold outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Priority Order{" "}
                <span className="normal-case font-medium">
                  (0 = shows first)
                </span>
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-4 py-3 border-2 border-zinc-900 text-[12px] font-bold outline-none focus:border-red-600"
              />
            </div>
          </div>

          {(formError || error) && (
            <p className="text-[11px] font-bold text-red-600 uppercase">
              {formError || error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-zinc-900 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {editingBanner ? "Save Changes" : "Publish Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;
