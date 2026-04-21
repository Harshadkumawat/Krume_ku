// frontend/src/components/admin/ProductFormParts/ImageUploadSection.jsx
// ✅ UPDATED — 1 critical fix
// FIX: URL.createObjectURL memory leak — now uses useMemo + cleanup

import React, { useMemo, useEffect } from "react";
import { Image as ImageIcon, UploadCloud, Trash2, X } from "lucide-react";

export default function ImageUploadSection({
  form,
  isEditMode,
  markImageForDeletion,
  onFilesChange,
  removeFileAt,
  maxImages = 8, // ✅ From parent
  SectionHeader,
}) {
  // ✅ FIX: Create blob URLs ONCE per file set — not on every render
  const filePreviews = useMemo(
    () => form.files.map((f) => URL.createObjectURL(f)),
    [form.files],
  );

  // ✅ FIX: Revoke blob URLs on change/unmount — prevents memory leak
  useEffect(() => {
    return () => {
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const totalImages = form.existingImages.length + form.files.length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl mt-6">
      <SectionHeader title="Product Images" icon={ImageIcon} />

      {/* Existing images (edit mode) */}
      {isEditMode && form.existingImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {form.existingImages.map((img) => (
            <div
              key={img.public_id}
              className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800"
            >
              <img
                src={img.url}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                alt="Product"
              />
              <button
                type="button"
                onClick={() => markImageForDeletion(img.public_id)}
                className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white shadow-xl active:scale-75"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div className="relative border-2 border-dashed border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 transition-all cursor-pointer group">
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onFilesChange}
        />
        <UploadCloud className="w-10 h-10 text-neutral-700 mb-3 group-hover:text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Tap to upload assets
        </p>
        {/* ✅ Show remaining slots */}
        <p className="text-[8px] font-bold text-neutral-600 mt-2 uppercase">
          {totalImages}/{maxImages} images used
        </p>
      </div>

      {/* New file previews — ✅ uses stable blob URLs */}
      {form.files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">
          {form.files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800 animate-in zoom-in"
            >
              <img
                src={filePreviews[i]}
                className="w-full h-full object-cover"
                alt="New upload"
              />
              <button
                type="button"
                onClick={() => removeFileAt(i)}
                className="absolute top-2 right-2 bg-black/70 p-1 rounded-full text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
