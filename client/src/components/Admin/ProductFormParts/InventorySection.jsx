import React from "react";
import { Package, Plus, Trash2, X } from "lucide-react";

export default function InventorySection({
  form,
  colorInput,
  setColorInput,
  addColor,
  removeColor,
  addSize,
  updateSize,
  removeSize,
  SIZE_OPTIONS,
  SectionHeader,
}) {
  // 💡 Naya Logic: Form mein kaunse sizes already hain
  const addedSizeLabels = form.sizes.map((s) => s.label);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl mt-6">
      <SectionHeader title="Inventory Matrix" icon={Package} />

      {/* Color Configuration block same rahega */}
      <div className="mb-8 pb-8 border-b border-neutral-800">
        <label className="input-label mb-3">Color Configuration</label>
        <div className="flex gap-3 mb-4">
          <input
            className="input-field"
            placeholder="Enter Color (e.g. Black)"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addColor())
            }
          />
          <button
            type="button"
            onClick={addColor}
            className="px-6 py-3 bg-indigo-600 text-[10px] font-black uppercase rounded-xl text-white shadow-xl hover:bg-indigo-500 active:scale-95 transition-all"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-neutral-300 text-[10px] font-bold uppercase border border-neutral-800 shadow-sm group"
            >
              {c}{" "}
              <X
                className="w-3 h-3 cursor-pointer group-hover:text-red-500 transition-colors"
                onClick={() => removeColor(c)}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <label className="input-label mb-0">Size & Stock</label>
        <button
          type="button"
          onClick={addSize}
          // Agar saare sizes add ho gaye hain to button disable kar do
          disabled={addedSizeLabels.length >= SIZE_OPTIONS.length}
          className="text-[9px] font-black uppercase bg-indigo-500 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={12} /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 scrollbar-hide">
        <table className="w-full text-left text-[11px] font-black uppercase tracking-widest min-w-[400px]">
          <thead className="bg-black">
            <tr>
              <th className="px-5 py-4 text-neutral-500">Size Label</th>
              <th className="px-5 py-4 text-center text-neutral-500">
                Stock Count
              </th>
              <th className="px-5 py-4 text-right text-neutral-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {form.sizes.map((s, i) => (
              <tr key={i} className="bg-neutral-900/50">
                <td className="px-5 py-4">
                  <select
                    className="bg-transparent outline-none cursor-pointer text-indigo-400"
                    value={s.label}
                    onChange={(e) => updateSize(i, "label", e.target.value)}
                  >
                    {SIZE_OPTIONS.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-neutral-900"
                        // 💡 UX Upgrade: Jo size kisi aur row mein already selected hai, use list se hatao nahi, par disable kar do
                        disabled={
                          addedSizeLabels.includes(opt) && opt !== s.label
                        }
                      >
                        {opt}{" "}
                        {addedSizeLabels.includes(opt) && opt !== s.label
                          ? "(Added)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    className="bg-black border border-neutral-800 rounded-lg w-20 px-3 py-1.5 text-center text-white outline-none focus:border-indigo-500"
                    value={s.stock}
                    onChange={(e) => updateSize(i, "stock", e.target.value)}
                  />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => removeSize(i)}
                    className="text-neutral-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
