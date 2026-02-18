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
          Loading Product...
        </p>
      </div>
    );

  if (isError || !singleProduct)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
        <h2 className="text-3xl font-black uppercase italic mb-4 text-zinc-300">
          Product Not Found
        </h2>
        <Link
          to="/products"
          className="text-xs font-bold tracking-widest uppercase border-b border-black pb-1 hover:text-gray-600 transition-colors"
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
    <div className="bg-white min-h-screen pb-32 selection:bg-black selection:text-white pt-10">
      {/* Breadcrumb Navigation */}
      <nav className="h-16 flex items-center px-6 lg:px-12 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-[1440px] w-full mx-auto flex justify-between text-[10px] font-bold uppercase italic tracking-[0.2em]">
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="text-gray-400 hover:text-black transition-colors"
            >
              Shop
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-black">{singleProduct.category}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-teal-600">
            <ShieldCheck size={14} /> <span>100% Authentic</span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column: Gallery & Specs */}
          <div className="lg:col-span-7">
            <ProductGallery images={singleProduct.images} />

            {/* Technical Specs */}
            {singleProduct.fabricCare && (
              <div className="mt-20 hidden lg:block border-t border-gray-100 pt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 italic">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-20">
                  {singleProduct.fabricCare.split("\n").map((line, index) => {
                    const parts = line.split(":");
                    if (parts.length < 2) return null;
                    return (
                      <div
                        key={index}
                        className="space-y-1 border-b border-zinc-50 pb-4 group"
                      >
                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest group-hover:text-black transition-colors">
                          {parts[0].trim()}
                        </p>
                        <p className="text-[12px] font-bold uppercase italic text-zinc-800">
                          {parts[1].trim()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28 space-y-10">
              <section className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-tight text-zinc-900">
                    {singleProduct.productName}
                  </h1>
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full border transition-all ${isWishlisted ? "bg-black border-black text-white shadow-md" : "border-gray-100 hover:border-black"}`}
                  >
                    <Heart
                      size={20}
                      className={isWishlisted ? "fill-white" : ""}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-3xl font-black italic tracking-tighter text-black">
                    ₹{singleProduct.finalPriceWithTax?.toLocaleString()}
                  </span>
                  {singleProduct.discountPercent > 0 && (
                    <span className="text-sm text-gray-400 line-through font-bold uppercase italic">
                      MRP ₹{singleProduct.price}
                    </span>
                  )}
                  <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded">
                    Inclusive of all taxes
                  </span>
                </div>
              </section>

              {/* Selectors */}
              <Suspense
                fallback={
                  <div className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
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

              {/* Pincode Check */}
              <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <MapPin size={14} className="text-black" /> Check Delivery
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter Pincode"
                    className="flex-1 bg-white p-4 rounded-xl outline-none text-[11px] font-bold uppercase border-2 border-transparent focus:border-black transition-all placeholder:text-gray-300"
                  />
                  <button
                    onClick={() => {
                      if (pincode.length === 6)
                        dispatch(getShippingDetails(pincode));
                      else toast.error("Please enter a valid 6-digit pincode");
                    }}
                    className="px-6 bg-black text-white rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all"
                  >
                    {isShipLoading ? "..." : "Check"}
                  </button>
                </div>
                {deliveryInfo && (
                  <div className="flex items-center gap-3 pt-1 animate-in slide-in-from-left-2 duration-300">
                    <Truck size={14} className="text-teal-600" />
                    <p className="text-[10px] font-bold uppercase italic text-teal-700">
                      Estimated Delivery by: {deliveryInfo.etd}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!singleProduct.inStock || isCartLoading}
                className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all active:scale-95 shadow-xl shadow-zinc-200 disabled:bg-zinc-200 disabled:text-gray-400"
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
              <div className="pt-6">
                {/* Description */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => toggleSection("desc")}
                    className="flex justify-between items-center w-full py-5 group"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] italic group-hover:pl-2 transition-all">
                      Product Details
                    </span>
                    <ChevronDown
                      className={`transition-transform duration-500 ${activeSection === "desc" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-700 ${activeSection === "desc" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pb-8 space-y-6">
                      <p className="text-[13px] font-medium text-zinc-500 leading-relaxed text-justify">
                        {singleProduct.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Returns & Exchange */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => toggleSection("return")}
                    className="flex justify-between items-center w-full py-5 group"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] italic group-hover:pl-2 transition-all">
                        Returns & Exchange
                      </span>
                    </div>
                    <ChevronDown
                      className={`transition-transform duration-500 ${activeSection === "return" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-700 ${activeSection === "return" ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pb-8 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 text-[10px] font-black">
                          7D
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">
                            7-Day Easy Returns
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium">
                            Return or exchange within 7 days of delivery if the
                            fit isn't perfect.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                          <Truck size={14} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">
                            Doorstep Pickup
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium">
                            Serviceable across 19,000+ pincodes. Nominal fee of
                            ₹50 for reverse pickup.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                          <Banknote size={14} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">
                            Refund Policy
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium">
                            Refunds processed to original source within 24 hours
                            of Quality Check.
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

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 flex items-center gap-4 z-50 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex flex-col min-w-fit">
          <span className="text-[10px] font-bold text-gray-400 italic">
            Total Price
          </span>
          <span className="text-xl font-black italic tracking-tighter">
            ₹{singleProduct.finalPriceWithTax}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 h-12 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 active:scale-95 transition-transform"
        >
          Add to Cart <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
