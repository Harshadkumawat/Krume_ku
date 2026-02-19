import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  resetAdmin,
} from "../../features/admin/adminSlice";
import {
  UploadCloud,
  X,
  Plus,
  Layers,
  DollarSign,
  Percent,
  Package,
  Image as ImageIcon,
  ArrowLeft,
  Trash2,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const GENDER_OPTIONS = ["Men", "Women", "Unisex", "Kids"];
const CATEGORY_OPTIONS = [
  "T-Shirts",
  "Shirts",
  "Trousers",
  "Kurta",
  "Jacket",
  "Sweater",
  "Jeans",
  "Ethnic Wear",
];
const SUBCATEGORY_OPTIONS = [
  "Printed",
  "Plain",
  "Oversized",
  "Embroidered",
  "Graphic",
  "Casual",
  "Formal",
];
const SEASON_OPTIONS = ["Summer", "Winter", "All Season"];

function mergeFiles(existing = [], incoming = []) {
  const key = (f) => `${f.name}-${f.size}-${f.lastModified}`;
  const map = new Map(existing.map((f) => [key(f), f]));
  for (const f of incoming) map.set(key(f), f);
  return Array.from(map.values());
}

export default function ProductForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { products, isLoading, isError, message } = useSelector(
    (state) => state.admin,
  );
  const isEditMode = !!id;

  const [form, setForm] = useState({
    productName: "",
    description: "",
    fabricCare: "",
    price: "",
    discountPercent: "",
    sizes: [{ label: "M", stock: 0 }],
    colors: [],
    files: [],
    existingImages: [],
    imagesToDelete: [],
    gender: "Men",
    category: "T-Shirts",
    subCategory: "Printed",
    season: "All Season",
    inStock: true,
    isFeatured: false,
  });

  const [colorInput, setColorInput] = useState("");

  const applyPreset = () => {
    const template = `Fabric: 100% Cotton\nFit: Oversized\nNeck: Round Neck\nSleeve: Half Sleeve\nCare: Machine wash cold`;
    setForm((prev) => ({ ...prev, fabricCare: template }));
    toast.info("Specs Template Applied");
  };

  useEffect(() => {
    if (isEditMode) {
      const productToEdit = products.find((p) => p._id === id);
      if (productToEdit) {
        setForm({
          ...form,
          productName: productToEdit.productName,
          description: productToEdit.description,
          fabricCare: productToEdit.fabricCare || "",
          price: productToEdit.price,
          discountPercent: productToEdit.discountPercent,
          sizes: productToEdit.sizes || [],
          colors: productToEdit.colors || [],
          gender: productToEdit.gender,
          category: productToEdit.category,
          subCategory: productToEdit.subCategory,
          season: productToEdit.season,
          inStock: productToEdit.inStock !== false,
          isFeatured: !!productToEdit.isFeatured,
          existingImages: productToEdit.images || [],
          files: [],
          imagesToDelete: [],
        });
      }
    }
  }, [id, isEditMode, products]);

  const { discountAmount, discountedPrice } = useMemo(() => {
    const price = Number(form.price) || 0;
    const percent =
      form.discountPercent !== "" ? Number(form.discountPercent) : 0;
    const discounted = price - (price * percent) / 100;
    return {
      discountAmount: Math.max(price - discounted, 0),
      discountedPrice: discounted > 0 ? discounted : 0,
    };
  }, [form.price, form.discountPercent]);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateSize = (index, key, value) => {
    setForm((f) => {
      const sizes = [...f.sizes];
      sizes[index] = { ...sizes[index], [key]: value };
      return { ...f, sizes };
    });
  };
  const addSize = () =>
    setForm((f) => ({ ...f, sizes: [...f.sizes, { label: "M", stock: 0 }] }));
  const removeSize = (i) =>
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));

  // 🔥 Colors Logic
  const addColor = () => {
    const c = colorInput.trim();
    if (!c || form.colors.includes(c)) return;
    setForm((f) => ({ ...f, colors: [...f.colors, c] }));
    setColorInput("");
  };

  const removeColor = (c) =>
    setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }));

  const onFilesChange = (e) =>
    setForm((f) => ({
      ...f,
      files: mergeFiles(f.files, Array.from(e.target.files || [])),
    }));

  const removeFileAt = (index) =>
    setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));

  const markImageForDeletion = (public_id) => {
    setForm((f) => ({
      ...f,
      existingImages: f.existingImages.filter(
        (img) => img.public_id !== public_id,
      ),
      imagesToDelete: [...f.imagesToDelete, public_id],
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("productName", form.productName.trim());
    fd.append("description", form.description.trim());
    fd.append("fabricCare", form.fabricCare.trim());
    fd.append("price", String(Number(form.price)));
    fd.append("discountPercent", String(Number(form.discountPercent || 0)));
    fd.append("gender", form.gender);
    fd.append("category", form.category);
    fd.append("subCategory", form.subCategory);
    fd.append("season", form.season);
    fd.append("inStock", String(!!form.inStock));
    fd.append("isFeatured", String(!!form.isFeatured));
    fd.append("sizes", JSON.stringify(form.sizes));
    fd.append("colors", JSON.stringify(form.colors));
    if (isEditMode)
      fd.append("imagesToDelete", JSON.stringify(form.imagesToDelete));
    for (const file of form.files) fd.append("images", file, file.name);

    try {
      if (isEditMode)
        await dispatch(updateProduct({ id, formData: fd })).unwrap();
      else await dispatch(createProduct(fd)).unwrap();
      toast.success("Success!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err);
    }
  }

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800">
      <Icon className="w-4 h-4 text-indigo-500" />
      <h2 className="text-[10px] font-black text-neutral-200 uppercase tracking-widest">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 pb-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* TOP BAR */}
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-neutral-900/50 p-4 md:p-6 rounded-2xl border border-neutral-800 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="p-2 bg-neutral-800 rounded-lg active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
          </div>
          {isLoading && (
            <span className="text-[10px] text-indigo-400 font-black animate-pulse uppercase tracking-widest">
              Saving Changes...
            </span>
          )}
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEFT SIDE: MAIN INFO */}
          <div className="lg:col-span-8 space-y-6">
            {/* BASIC INFO */}
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
                      onChange={(e) =>
                        updateField("subCategory", e.target.value)
                      }
                    >
                      {SUBCATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Gender</label>
                  <div className="flex flex-wrap bg-black p-1 rounded-xl border border-neutral-800">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => updateField("gender", g)}
                        className={`flex-1 min-w-[70px] text-[9px] font-black uppercase py-2.5 rounded-lg transition-all ${form.gender === g ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-600"}`}
                      >
                        {g}
                      </button>
                    ))}
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
                    <label className="input-label mb-0">
                      Fabric & Care Details
                    </label>
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

            {/* VISUAL ASSETS */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <SectionHeader title="Product Images" icon={ImageIcon} />

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
              </div>

              {form.files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-6">
                  {form.files.map((file, i) => (
                    <div
                      key={i}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800 animate-in zoom-in"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFileAt(i)}
                        className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🔥 MATRIX: COLORS & SIZES */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <SectionHeader title="Inventory Matrix" icon={Package} />

              {/* Color Configuration Restored */}
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
                      {c}
                      <X
                        className="w-3 h-3 cursor-pointer group-hover:text-red-500 transition-colors"
                        onClick={() => removeColor(c)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Sizes Table */}
              <div className="flex justify-between items-center mb-4">
                <label className="input-label mb-0">Size & Stock</label>
                <button
                  type="button"
                  onClick={addSize}
                  className="text-[9px] font-black uppercase bg-indigo-500 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1"
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
                      <th className="px-5 py-4 text-right text-neutral-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {form.sizes.map((s, i) => (
                      <tr key={i} className="bg-neutral-900/50">
                        <td className="px-5 py-4">
                          <select
                            className="bg-transparent outline-none cursor-pointer text-indigo-400"
                            value={s.label}
                            onChange={(e) =>
                              updateSize(i, "label", e.target.value)
                            }
                          >
                            {SIZE_OPTIONS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-neutral-900"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <input
                            type="number"
                            className="bg-black border border-neutral-800 rounded-lg w-20 px-3 py-1.5 text-center text-white outline-none focus:border-indigo-500"
                            value={s.stock}
                            onChange={(e) =>
                              updateSize(i, "stock", e.target.value)
                            }
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
          </div>

          {/* RIGHT SIDE: PRICING & CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl lg:sticky lg:top-6">
              <SectionHeader title="Pricing Protocol" icon={DollarSign} />
              <div className="space-y-5">
                <div>
                  <label className="input-label">M.R.P (₹)</label>
                  <input
                    required
                    type="number"
                    className="input-field text-lg font-black"
                    placeholder="999"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Discount %</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input-field"
                      placeholder="10"
                      value={form.discountPercent}
                      onChange={(e) =>
                        updateField("discountPercent", e.target.value)
                      }
                    />
                    <Percent
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600"
                      size={14}
                    />
                  </div>
                </div>

                <div className="bg-black rounded-2xl p-5 border border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-neutral-500">
                      Sale Price
                    </span>
                    <span className="text-xl font-black text-indigo-400 italic">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-red-500">
                    <span className="text-[9px] font-black uppercase">
                      Savings
                    </span>
                    <span className="text-[11px] font-black">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-neutral-800">
                    <span className="text-[10px] font-black uppercase text-neutral-500">
                      In Stock
                    </span>
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => updateField("inStock", e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-neutral-800">
                    <span className="text-[10px] font-black uppercase text-neutral-500">
                      Featured
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        updateField("isFeatured", e.target.checked)
                      }
                      className="accent-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-white/5"
                >
                  {isLoading
                    ? "Processing..."
                    : isEditMode
                      ? "Update Product"
                      : "Publish Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .input-label { display: block; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #737373; margin-bottom: 8px; font-style: italic; }
        .input-field { width: 100%; padding: 14px 18px; border-radius: 12px; background-color: #000000; border: 1px solid #262626; color: #ffffff; font-size: 14px; font-weight: 600; outline: none; transition: all 0.3s ease; }
        .input-field:focus { border-color: #6366f1; background-color: #050505; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
