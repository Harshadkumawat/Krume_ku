import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, updateProduct } from "../../features/admin/adminSlice";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

import BasicInfoSection from "./ProductFormParts/BasicInfoSection";
import ImageUploadSection from "./ProductFormParts/ImageUploadSection";
import InventorySection from "./ProductFormParts/InventorySection";
import PricingSection from "./ProductFormParts/PricingSection";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const GENDER_OPTIONS = ["Men", "Women", "Unisex", "Kids"];
const CATEGORY_OPTIONS = [
  "T-Shirts",
  "Shirts",
  "Hoodies",
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
  "Bleach Art",
];

const SEASON_OPTIONS = ["Summer", "Winter", "All Season"];

const MAX_IMAGES = 8;

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

  const { products, isLoading } = useSelector((state) => state.admin);
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

    isFeatured: false,
    isNewArrival: false,
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
        setForm((prev) => ({
          ...prev,
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
          season: productToEdit.season || "All Season",
          isFeatured: !!productToEdit.isFeatured,
          isNewArrival: !!productToEdit.isNewArrival,
          existingImages: productToEdit.images || [],
          files: [],
          imagesToDelete: [],
        }));
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

  const updateSize = (index, key, value) =>
    setForm((f) => {
      const sizes = [...f.sizes];
      sizes[index] = { ...sizes[index], [key]: value };
      return { ...f, sizes };
    });

  const addSize = () => {
    setForm((f) => {
      const existingLabels = f.sizes.map((s) => s.label);
      const nextSizeLabel = SIZE_OPTIONS.find(
        (opt) => !existingLabels.includes(opt),
      );
      if (!nextSizeLabel) {
        toast.info("All sizes are already added.");
        return f;
      }
      return {
        ...f,
        sizes: [...f.sizes, { label: nextSizeLabel, stock: 0 }],
      };
    });
  };

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

  const onFilesChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    setForm((f) => {
      const merged = mergeFiles(f.files, incoming);
      const totalImages = f.existingImages.length + merged.length;
      if (totalImages > MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return {
          ...f,
          files: merged.slice(0, MAX_IMAGES - f.existingImages.length),
        };
      }
      return { ...f, files: merged };
    });
  };

  const removeFileAt = (index) =>
    setForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));

  const markImageForDeletion = (public_id) =>
    setForm((f) => ({
      ...f,
      existingImages: f.existingImages.filter(
        (img) => img.public_id !== public_id,
      ),
      imagesToDelete: [...f.imagesToDelete, public_id],
    }));

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
    // ✅ FIX 1: Removed inStock — backend pre-save calculates from sizes
    fd.append("isFeatured", String(!!form.isFeatured));
    fd.append("isNewArrival", String(!!form.isNewArrival));
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
          <div className="lg:col-span-8 space-y-6">
            <BasicInfoSection
              form={form}
              updateField={updateField}
              applyPreset={applyPreset}
              CATEGORY_OPTIONS={CATEGORY_OPTIONS}
              SUBCATEGORY_OPTIONS={SUBCATEGORY_OPTIONS}
              GENDER_OPTIONS={GENDER_OPTIONS}
              SEASON_OPTIONS={SEASON_OPTIONS}
              SectionHeader={SectionHeader}
            />

            <ImageUploadSection
              form={form}
              isEditMode={isEditMode}
              markImageForDeletion={markImageForDeletion}
              onFilesChange={onFilesChange}
              removeFileAt={removeFileAt}
              maxImages={MAX_IMAGES}
              SectionHeader={SectionHeader}
            />

            <InventorySection
              form={form}
              colorInput={colorInput}
              setColorInput={setColorInput}
              addColor={addColor}
              removeColor={removeColor}
              addSize={addSize}
              updateSize={updateSize}
              removeSize={removeSize}
              SIZE_OPTIONS={SIZE_OPTIONS}
              SectionHeader={SectionHeader}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PricingSection
              form={form}
              updateField={updateField}
              discountedPrice={discountedPrice}
              discountAmount={discountAmount}
              isLoading={isLoading}
              isEditMode={isEditMode}
              SectionHeader={SectionHeader}
            />
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
