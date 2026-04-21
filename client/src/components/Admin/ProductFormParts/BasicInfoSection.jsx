// frontend/src/components/admin/ProductFormParts/BasicInfoSection.jsx
// ✅ UPDATED — 1 fix
// FIX: Added Season selector — was hardcoded "All Season" before

import React from "react";
import { Layers, Sparkles } from "lucide-react";

export default function BasicInfoSection({
  form,
  updateField,
  applyPreset,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  GENDER_OPTIONS,
  SEASON_OPTIONS, // ✅ FIX: New prop
  SectionHeader,
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl">
      <SectionHeader title="Basic Information" icon={Layers} />
      <div className="space-y-6">
        <div>
          <label className="input-label">Product Name</label>
          <input
            required
            className="input-field"
            placeholder="E.g. Oversized Cotton Tee"
            value={form.productName}
            onChange={(e) => updateField("productName", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Category</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">Sub Category</label>
            <select
              className="input-field"
              value={form.subCategory}
              onChange={(e) => updateField("subCategory", e.target.value)}
            >
              {SUBCATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ FIX: Season selector — was missing entirely */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Gender</label>
            <div className="flex flex-wrap bg-black p-1 rounded-xl border border-neutral-800">
              {GENDER_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => updateField("gender", g)}
                  className={`flex-1 min-w-[70px] text-[9px] font-black uppercase py-2.5 rounded-lg transition-all ${
                    form.gender === g
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-neutral-600"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Season</label>
            <div className="flex flex-wrap bg-black p-1 rounded-xl border border-neutral-800">
              {SEASON_OPTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => updateField("season", s)}
                  className={`flex-1 min-w-[70px] text-[9px] font-black uppercase py-2.5 rounded-lg transition-all ${
                    form.season === s
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-neutral-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="input-label">Description</label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Write something about this product..."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <div className="flex justify-between items-center mb-3">
            <label className="input-label mb-0">Fabric & Care Details</label>
            <button
              type="button"
              onClick={applyPreset}
              className="text-[8px] font-black uppercase text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-md flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={10} /> AI Template
            </button>
          </div>
          <textarea
            rows={4}
            className="input-field font-mono text-[11px]"
            placeholder="Fabric: 100% Cotton..."
            value={form.fabricCare}
            onChange={(e) => updateField("fabricCare", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
