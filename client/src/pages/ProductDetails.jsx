import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader2,
  Heart,
  ChevronDown,
  ShieldCheck,
  Zap,
  Truck,
  MapPin,
  ArrowRight,
  RotateCcw,
  Banknote,
  RefreshCw, // 🔥 Added for Exchange icon
} from "lucide-react";
import { toast } from "react-toastify";

import { addToCart } from "../features/cart/cartSlice";
import { addToWishlist } from "../features/wishlist/wishlistSlice";
import { getSingleProduct } from "../features/products/productSlice";
import {
  getShippingDetails,
  resetShipping,
} from "../features/shipping/shippingSlice";

import ProductGallery from "../components/singleProduct/ProductGallery";

const ProductSelectors = lazy(
  () => import("../components/singleProduct/ProductSelectors"),
);

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { singleProduct, isLoading, isError } = useSelector((s) => s.products);
  const { isLoading: isCartLoading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { wishlistItems } = useSelector((s) => s.wishlist);
  const { deliveryInfo, isLoading: isShipLoading } = useSelector(
    (s) => s.shipping,
  );

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [activeSection, setActiveSection] = useState("desc");

  useEffect(() => {
    if (id) {
      dispatch(getSingleProduct(id));
      dispatch(resetShipping());
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setActiveSection("desc");
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleWishlist = () => {
    if (!user) {
      toast.info("Please login to save items");
      return navigate("/login");
    }
    dispatch(addToWishlist(singleProduct._id));
  };

  const handleAddToCart = () => {
    if (singleProduct.sizes?.length > 0 && !selectedSize)
      return toast.error("Please select a size");
    if (singleProduct.colors?.length > 0 && !selectedColor)
      return toast.error("Please select a color");

    dispatch(
      addToCart({
        productId: singleProduct._id,
        quantity,
        size: selectedSize || "One Size",
        color: selectedColor || "Default",
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Added to Cart");
        navigate("/cart");
      })
      .catch((err) => toast.error(err));
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-black mb-4" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] italic animate-pulse">
          Loading Details...
        </p>
      </div>
    );

  if (isError || !singleProduct)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
        <h2 className="text-2xl font-black uppercase italic mb-6 text-zinc-300">
          Oops! Product Not Found
        </h2>
        <Link
          to="/products"
          className="text-[10px] font-black tracking-widest uppercase border-b-2 border-black pb-1 hover:text-zinc-500 transition-all"
        >
          Back to Collection
        </Link>
      </div>
    );

  const isWishlisted = wishlistItems?.some(
    (item) =>
      item._id === singleProduct._id || item.product === singleProduct._id,
  );

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-32 selection:bg-black selection:text-white pt-6 lg:pt-10 overflow-x-hidden">
      {/* 🧭 Navigation Header */}
      <nav className="h-14 lg:h-16 flex items-center px-4 lg:px-12 border-b border-gray-50 sticky top-0 bg-white/90 backdrop-blur-md z-[60]">
        <div className="max-w-[1440px] w-full mx-auto flex justify-between items-center text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest">
          <div className="flex items-center gap-2 lg:gap-3">
            <Link
              to="/products"
              className="text-gray-400 hover:text-black transition-colors"
            >
              Shop
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-black truncate max-w-[100px] lg:max-w-none">
              {singleProduct.category}
            </span>
          </div>
          <div className="flex items-center gap-2 text-teal-600">
            <ShieldCheck size={14} className="hidden sm:block" />{" "}
            <span className="font-black">Authentic Piece</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-6 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          {/* 🖼️ Left Column: Gallery & Specs */}
          <div className="lg:col-span-7">
            <div className="-mx-4 lg:mx-0">
              <ProductGallery images={singleProduct.images} />
            </div>

            {/* Technical Specs */}
            {singleProduct.fabricCare && (
              <div className="mt-16 border-t border-gray-100 pt-10 animate-in fade-in slide-in-from-bottom-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 italic">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {singleProduct.fabricCare.split("\n").map((line, index) => {
                    const parts = line.split(":");
                    if (parts.length < 2) return null;
                    return (
                      <div
                        key={index}
                        className="flex flex-col border-b border-zinc-50 pb-3 group transition-all"
                      >
                        <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest group-hover:text-black">
                          {parts[0].trim()}
                        </span>
                        <span className="text-[12px] font-black uppercase italic text-zinc-800 mt-0.5">
                          {parts[1].trim()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 📋 Right Column: Details & Actions */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28 space-y-8 lg:space-y-10">
              <section className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter italic leading-tight text-zinc-900">
                    {singleProduct.productName}
                  </h1>
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full border shrink-0 transition-all ${isWishlisted ? "bg-black border-black text-white shadow-lg" : "border-gray-100 hover:border-black"}`}
                  >
                    <Heart
                      size={20}
                      className={isWishlisted ? "fill-white" : ""}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                  <span className="text-2xl lg:text-4xl font-black italic tracking-tighter text-black">
                    ₹{singleProduct.finalPriceWithTax?.toLocaleString()}
                  </span>
                  {singleProduct.discountPercent > 0 && (
                    <span className="text-sm lg:text-base text-gray-400 line-through font-bold italic uppercase">
                      MRP ₹{singleProduct.price}
                    </span>
                  )}
                  <div className="bg-teal-50 px-2 py-1 rounded">
                    <span className="text-[8px] font-black text-teal-600 uppercase tracking-widest italic tracking-tighter">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>
              </section>

              {/* Selectors */}
              <div className="p-0.5">
                <Suspense
                  fallback={
                    <div className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
                  }
                >
                  <ProductSelectors
                    colors={singleProduct.colors}
                    sizes={singleProduct.sizes}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    quantity={quantity}
                    handleQuantity={(type) =>
                      type === "inc"
                        ? setQuantity((q) => (q < 10 ? q + 1 : q))
                        : setQuantity((q) => (q > 1 ? q - 1 : q))
                    }
                  />
                </Suspense>
              </div>

              {/* Pincode Check */}
              <div className="bg-zinc-50 p-5 lg:p-6 rounded-[1.5rem] border border-zinc-100 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <MapPin size={14} className="text-black" /> Delivery Check
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter Pincode"
                    className="flex-1 bg-white p-3.5 rounded-xl outline-none text-xs font-black uppercase border-2 border-transparent focus:border-black transition-all placeholder:text-gray-300"
                  />
                  <button
                    onClick={() =>
                      pincode.length === 6
                        ? dispatch(getShippingDetails(pincode))
                        : toast.error("Enter valid pincode")
                    }
                    className="px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-all active:scale-95"
                  >
                    {isShipLoading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
                {deliveryInfo && (
                  <div className="flex items-center gap-3 pt-1 animate-in slide-in-from-left-2">
                    <Truck size={14} className="text-teal-600 shrink-0" />
                    <p className="text-[10px] font-black uppercase italic text-teal-700 tracking-tighter">
                      Delivery by: {deliveryInfo.etd}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart Button (Desktop only) */}
              <button
                onClick={handleAddToCart}
                disabled={!singleProduct.inStock || isCartLoading}
                className="hidden lg:flex w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-95 shadow-xl shadow-zinc-100 disabled:bg-zinc-200"
              >
                {isCartLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Zap size={16} fill="white" /> ADD TO CART
                  </>
                )}
              </button>

              {/* Accordions */}
              <div className="pt-4 divide-y divide-gray-100">
                {/* Description */}
                <div className="py-1">
                  <button
                    onClick={() => toggleSection("desc")}
                    className="flex justify-between items-center w-full py-4 group"
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest italic text-zinc-900 group-hover:pl-1 transition-all">
                      Product Story
                    </span>
                    <ChevronDown
                      className={`transition-transform duration-500 w-4 h-4 ${activeSection === "desc" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${activeSection === "desc" ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="pb-6 text-[13px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight text-justify">
                      {singleProduct.description}
                    </p>
                  </div>
                </div>

                {/* 🔥 Updated Returns & Exchange Section */}
                <div className="py-1">
                  <button
                    onClick={() => toggleSection("return")}
                    className="flex justify-between items-center w-full py-4 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <RotateCcw size={14} />
                      <span className="text-[11px] font-black uppercase tracking-widest italic text-zinc-900 group-hover:pl-1 transition-all">
                        Exchange & Returns
                      </span>
                    </div>
                    <ChevronDown
                      className={`transition-transform duration-500 w-4 h-4 ${activeSection === "return" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${activeSection === "return" ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pb-8 space-y-6">
                      {/* Exchange Policy */}
                      <div className="flex gap-4">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                          <RefreshCw size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-black">
                            Easy Exchange
                          </h4>
                          <p className="text-[10px] md:text-[11px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">
                            Found a fit issue? Request an exchange within 7
                            days. We'll pick it up and deliver the new size for
                            a nominal ₹50 fee.
                          </p>
                        </div>
                      </div>

                      {/* Refund Policy */}
                      <div className="flex gap-4">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Banknote size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-black">
                            Hassle-Free Returns
                          </h4>
                          <p className="text-[10px] md:text-[11px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">
                            Changed your mind? Return within 7 days. Refunds are
                            credited back to your original payment mode within
                            24-48 hours after Quality Check.
                          </p>
                        </div>
                      </div>

                      {/* QC Policy */}
                      <div className="flex gap-4">
                        <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                          <ShieldCheck size={16} className="text-zinc-600" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-black">
                            Quality Commitment
                          </h4>
                          <p className="text-[10px] md:text-[11px] text-zinc-500 font-bold uppercase tracking-tighter mt-1">
                            Artifact must be unused, unwashed, and with all
                            original tags intact for a successful
                            return/exchange protocol.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 📱 Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 px-5 py-4 flex items-center gap-5 z-[100] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] animate-in slide-in-from-bottom duration-500">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-400 uppercase italic">
            Final Price
          </span>
          <span className="text-xl font-black italic tracking-tighter text-black">
            ₹{singleProduct.finalPriceWithTax}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!singleProduct.inStock || isCartLoading}
          className="flex-1 h-12 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all disabled:bg-zinc-200"
        >
          {isCartLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              ADD TO CART <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
