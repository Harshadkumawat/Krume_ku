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
    fabricCare: "", // 🔥 Fabric & Care Blueprint naya field
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

  // AI Logic for Fabric & Care template
  const applyPreset = () => {
    const template = `Fabric: 100% Cotton\nFit: Oversized\nNeck: Round Neck\nSleeve: Half Sleeve\nCare: Machine wash cold, do not bleach`;
    setForm((prev) => ({
      ...prev,
      fabricCare: template,
    }));
    toast.info("AI Specs Template Applied");
  };

  useEffect(() => {
    if (isEditMode) {
      const productToEdit = products.find((p) => p._id === id);
      if (productToEdit) {
        setForm({
          ...form,
          productName: productToEdit.productName,
          description: productToEdit.description,
          fabricCare: productToEdit.fabricCare || "", // Load existing fabricCare
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
    const discountAmt = Math.max(price - discounted, 0);
    return {
      discountAmount: Number.isFinite(discountAmt)
        ? +discountAmt.toFixed(2)
        : 0,
      discountedPrice: Number.isFinite(discounted) ? +discounted.toFixed(2) : 0,
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
    if (!form.productName.trim()) return toast.warn("Product name required");
    if (!form.price) return toast.warn("Price required");

    const fd = new FormData();

    fd.append("productName", form.productName.trim());
    fd.append("description", form.description.trim());
    fd.append("fabricCare", form.fabricCare.trim()); // 🔥 Sending fabricCare to backend
    fd.append("price", String(Number(form.price)));
    fd.append("discountPercent", String(Number(form.discountPercent || 0)));
    fd.append("gender", form.gender);
    fd.append("category", form.category);
    fd.append("subCategory", form.subCategory);
    fd.append("season", form.season);
    fd.append("inStock", String(!!form.inStock));
    fd.append("isFeatured", String(!!form.isFeatured));

    fd.append(
      "sizes",
      JSON.stringify(
        form.sizes.map((s) => ({
          label: s.label,
          stock: Number(s.stock) || 0,
        })),
      ),
    );
    fd.append("colors", JSON.stringify(form.colors));

    if (isEditMode) {
      fd.append("imagesToDelete", JSON.stringify(form.imagesToDelete));
    }

    for (const file of form.files) {
      fd.append("images", file, file.name);
    }

    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, formData: fd })).unwrap();
        toast.success("Product Updated Successfully!");
      } else {
        await dispatch(createProduct(fd)).unwrap();
        toast.success("Product Published Successfully!");
      }

      navigate("/admin/products");
      dispatch(resetAdmin());
    } catch (err) {
      toast.error(err || "Process failed.");
    }
  }

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(resetAdmin());
    }
  }, [isError, message, dispatch]);

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
      <Icon className="w-4 h-4 text-indigo-500" />
      <h2 className="text-[10px] font-black text-neutral-200 uppercase tracking-[0.2em]">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <header className="mb-6 flex items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 shadow-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-all active:scale-90"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-400" />
            </button>
            <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">
              {isEditMode ? "Update Registry" : "New Entry"}
            </h1>
          </div>
          {isLoading && (
            <span className="text-[9px] text-indigo-400 font-black animate-pulse uppercase tracking-[0.3em]">
              Syncing Archives...
            </span>
          )}
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
              <SectionHeader title="Entity Details" icon={Layers} />
              <div className="space-y-5">
                <div>
                  <label className="input-label">Identity Name</label>
                  <input
                    required
                    className="input-field"
                    placeholder="..."
                    value={form.productName}
                    onChange={(e) => updateField("productName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Core Tier</label>
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
                    <label className="input-label">Sub Classification</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Demographic</label>
                    <div className="flex bg-black p-1 rounded-xl border border-neutral-800 shadow-inner">
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => updateField("gender", g)}
                          className={`flex-1 text-[9px] font-black uppercase py-2 rounded-lg transition-all ${form.gender === g ? "bg-indigo-600 text-white shadow-lg" : "text-neutral-600 hover:text-neutral-400"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Operational Season</label>
                    <select
                      className="input-field"
                      value={form.season}
                      onChange={(e) => updateField("season", e.target.value)}
                    >
                      {SEASON_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Description Brief</label>
                  <textarea
                    rows={3}
                    className="input-field resize-none"
                    placeholder="..."
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>

                {/* --- 🆕 FABRIC & CARE BLUEPRINT (Point to Point) --- */}
                <div className="pt-4 border-t border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <SectionHeader
                      title="Fabric & Care Blueprint"
                      icon={Info}
                    />
                    <button
                      type="button"
                      onClick={applyPreset}
                      className="text-[8px] font-black uppercase text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Sparkles size={10} /> Generate AI Specs
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    className="input-field resize-none font-mono text-[11px]"
                    placeholder="Fabric: 100% Cotton&#10;Fit: Oversized&#10;Neck: Round Neck..."
                    value={form.fabricCare}
                    onChange={(e) => updateField("fabricCare", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: VISUAL ASSETS --- */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
              <SectionHeader title="Visual Assets" icon={ImageIcon} />
              {isEditMode && form.existingImages.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {form.existingImages.map((img) => (
                    <div
                      key={img.public_id}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-800"
                    >
                      <img
                        src={img.url}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img.public_id)}
                        className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all active:scale-75 shadow-xl"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative border-2 border-dashed border-neutral-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-600/5 hover:border-indigo-500/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={onFilesChange}
                />
                <div className="p-4 bg-neutral-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-neutral-500 group-hover:text-indigo-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-neutral-300">
                  Authorize Asset Upload
                </p>
              </div>
              {form.files.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-6">
                  {form.files.map((file, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-800 shadow-xl animate-in fade-in zoom-in duration-300"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFileAt(i)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- SECTION 3: REGISTRY MATRIX --- */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
              <SectionHeader title="Registry Matrix" icon={Package} />
              <div className="mb-8">
                <label className="input-label mb-3 font-black">
                  Color Configuration
                </label>
                <div className="flex gap-3 mb-4">
                  <input
                    className="input-field"
                    placeholder="Entry Tag..."
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addColor())
                    }
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-6 py-2 bg-indigo-600 text-[10px] font-black uppercase rounded-xl text-white shadow-xl hover:bg-indigo-500 active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.colors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-neutral-300 text-[9px] font-black uppercase border border-neutral-800 shadow-lg group"
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
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="input-label font-black">
                    Scale Availability
                  </label>
                  <button
                    type="button"
                    onClick={addSize}
                    className="text-[9px] font-black uppercase text-indigo-400 flex items-center gap-1 hover:text-white bg-indigo-500/10 px-3 py-1 rounded-lg transition-all"
                  >
                    <Plus className="w-3 h-3" /> New Scale
                  </button>
                </div>
                <div className="border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    <thead className="bg-black">
                      <tr>
                        <th className="px-6 py-4">Scale</th>
                        <th className="px-6 py-4 text-center">Unit Count</th>
                        <th className="px-6 py-4 text-right">Operation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 bg-neutral-900/50">
                      {form.sizes.map((s, i) => (
                        <tr
                          key={i}
                          className="hover:bg-indigo-600/5 transition-all"
                        >
                          <td className="px-6 py-4 text-neutral-200">
                            <select
                              className="bg-transparent outline-none w-full font-bold cursor-pointer"
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
                          <td className="px-6 py-4 flex justify-center">
                            <input
                              type="number"
                              min="0"
                              className="bg-black border border-neutral-800 rounded-lg w-24 px-4 py-2 text-center text-indigo-400 font-bold outline-none focus:border-indigo-500 shadow-inner"
                              value={s.stock}
                              onChange={(e) =>
                                updateSize(i, "stock", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeSize(i)}
                              className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-600 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl sticky top-6">
              <SectionHeader title="Financial Protocol" icon={DollarSign} />
              <div className="space-y-5">
                <div>
                  <label className="input-label">Official M.R.P</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-black">
                      ₹
                    </span>
                    <input
                      required
                      type="number"
                      className="input-field pl-8 font-black text-base"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Markdown %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="input-field font-black"
                      value={form.discountPercent}
                      onChange={(e) =>
                        updateField("discountPercent", e.target.value)
                      }
                    />
                    <Percent className="w-3 h-3 text-neutral-600 absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="bg-black rounded-2xl p-5 border border-neutral-800 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black uppercase text-neutral-500">
                      Net Value
                    </span>
                    <span className="text-xl font-black text-indigo-400 tracking-tighter">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <span className="text-[8px] font-black text-neutral-600 uppercase">
                      Archive Savings
                    </span>
                    <span className="text-[10px] font-black text-red-500 tracking-tight">
                      -₹{discountAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-neutral-800">
                  <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-neutral-800 group cursor-pointer hover:border-indigo-500 transition-all shadow-inner">
                    <span className="text-[9px] font-black uppercase text-neutral-400 group-hover:text-neutral-200">
                      Active Stock
                    </span>
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => updateField("inStock", e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 cursor-pointer shadow-2xl"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-neutral-800 group cursor-pointer hover:border-indigo-500 transition-all shadow-inner">
                    <span className="text-[9px] font-black uppercase text-neutral-400 group-hover:text-neutral-200">
                      Highlight Registry
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        updateField("isFeatured", e.target.checked)
                      }
                      className="accent-indigo-500 w-4 h-4 cursor-pointer shadow-2xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Executing..."
                  ) : (
                    <>{isEditMode ? "Update Core" : "Commit to Archives"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .input-label { display: block; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #404040; margin-bottom: 8px; }
        .input-field { width: 100%; padding: 12px 16px; border-radius: 14px; background-color: #000000; border: 1px solid #171717; color: #ffffff; font-size: 13px; font-weight: 500; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .input-field:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
      `}</style>
    </div>
  );
}
