import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Heart, Truck, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";

import { addToCart } from "../features/cart/cartSlice";
import { addToWishlist } from "../features/wishlist/wishlistSlice";
import { getSingleProduct } from "../features/products/productSlice";
import {
  getShippingDetails,
  resetShipping,
} from "../features/shipping/shippingSlice";

import ProductGallery from "../components/singleProduct/ProductGallery";
import SEO from "../components/SEO";
// 🚀 Naya Import
import RelatedProducts from "../components/singleProduct/RelatedProducts";

const ProductSelectors = lazy(
  () => import("../components/singleProduct/ProductSelectors"),
);

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🚀 relatedProducts ko state se nikala (jo tumne screenshot mein dikhaya tha)
  const { singleProduct, relatedProducts, isLoading, isError } = useSelector(
    (s) => s.products,
  );
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

  useEffect(() => {
    if (id) {
      dispatch(getSingleProduct(id));
      dispatch(resetShipping());
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  const handleWishlist = () => {
    if (!user) {
      toast.info("Please login to save items");
      return navigate("/login");
    }
    dispatch(addToWishlist(singleProduct?._id));
  };

  const handleAddToCart = () => {
    if (singleProduct?.sizes?.length > 0 && !selectedSize)
      return toast.error("Please select a size.");
    if (singleProduct?.colors?.length > 0 && !selectedColor)
      return toast.error("Please select a color.");

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

  const isWishlisted = wishlistItems?.some(
    (item) =>
      item._id === singleProduct?._id || item.product === singleProduct?._id,
  );

  const baseTitle = isLoading
    ? "Loading Piece..."
    : singleProduct?.productName || "Piece Not Found";

  const pageTitle = isLoading ? baseTitle : `Buy ${baseTitle}`;

  const seoDescription = singleProduct?.description
    ? singleProduct.description.substring(0, 160)
    : "Premium streetwear by Krumeku. Explore exclusive oversized and embroidered tees.";

  const seoImage =
    singleProduct?.images?.[0]?.url || singleProduct?.images?.[0]?.secure_url;

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      <SEO
        title={pageTitle}
        description={seoDescription}
        image={seoImage}
        url={`https://www.krumeku.com/item/${id}`}
        type="product"
      />

      {isLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center pt-20">
          <Loader2 className="animate-spin text-black mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic text-zinc-400">
            Loading Piece...
          </p>
        </div>
      ) : isError || !singleProduct ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center pt-20">
          <h2 className="text-xl font-black uppercase italic mb-4 text-zinc-400">
            Piece Not Found
          </h2>
          <Link
            to="/products"
            className="text-[10px] font-black tracking-widest uppercase border-b-2 border-black pb-1"
          >
            Back to Archive
          </Link>
        </div>
      ) : (
        <div className="pb-24 lg:pb-10 pt-20 md:pt-24">
          {/* Breadcrumbs */}
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mb-4 lg:mb-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <Link to="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                to={`/products?category=${singleProduct.category}`}
                className="hover:text-black transition-colors"
              >
                {singleProduct.category}
              </Link>
              <span>/</span>
              <span className="text-black truncate max-w-[150px]">
                {singleProduct.productName}
              </span>
            </div>
          </div>

          <main className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Image Gallery & Specs (Desktop) */}
              <div className="w-full lg:w-[60%] xl:w-[65%]">
                <ProductGallery
                  images={singleProduct.images}
                  productName={singleProduct.productName}
                />

                {singleProduct.fabricCare && (
                  <div className="mt-10 hidden lg:block border-t border-zinc-100 pt-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6">
                      Product Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
                      {singleProduct.fabricCare
                        .split("\n")
                        .map((line, index) => {
                          const parts = line.split(":");
                          if (parts.length < 2) return null;
                          return (
                            <div
                              key={index}
                              className="flex flex-col border-b border-zinc-100 pb-2"
                            >
                              <span className="text-zinc-500 font-medium mb-1">
                                {parts[0].trim()}
                              </span>
                              <span className="font-bold text-black uppercase">
                                {parts[1].trim()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-24">
                <div className="mb-6 border-b border-zinc-100 pb-6">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 leading-tight mb-2">
                    {singleProduct.productName}
                  </h1>
                  <p className="text-sm font-medium text-zinc-500 mb-4">
                    {singleProduct.subCategory || singleProduct.category}
                  </p>

                  <div className="flex items-end gap-3 mb-1">
                    <span className="text-2xl font-black text-black">
                      ₹{singleProduct.finalPriceWithTax?.toLocaleString()}
                    </span>
                    {singleProduct.discountPercent > 0 && (
                      <span className="text-base text-zinc-400 line-through font-bold mb-0.5">
                        ₹{singleProduct.price}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-teal-600">
                    Price incl. of all taxes
                  </p>
                </div>

                <div className="mb-8">
                  <Suspense
                    fallback={
                      <div className="h-40 bg-zinc-50 animate-pulse rounded-xl" />
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

                <div className="flex gap-3 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={!singleProduct.inStock || isCartLoading}
                    className="flex-[2] bg-[#E94A3F] hover:bg-[#d43a30] text-white py-4 rounded-md text-sm font-black uppercase tracking-widest transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCartLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Add to Cart"
                    )}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className={`flex-[1] border rounded-md flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase transition-all ${
                      isWishlisted
                        ? "border-[#E94A3F] text-[#E94A3F] bg-red-50"
                        : "border-zinc-300 hover:border-black text-black"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={isWishlisted ? "fill-[#E94A3F]" : ""}
                    />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-black uppercase tracking-widest mb-3">
                    Delivery Details
                  </h4>
                  <div className="flex h-12 bg-white border border-zinc-200 rounded-md overflow-hidden focus-within:border-black transition-colors">
                    <input
                      type="text"
                      maxLength="6"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter Pincode"
                      className="flex-1 px-4 text-sm font-medium outline-none"
                    />
                    <button
                      onClick={() =>
                        pincode.length === 6
                          ? dispatch(getShippingDetails(pincode))
                          : toast.error("Enter valid pincode")
                      }
                      className="px-6 bg-zinc-100 text-teal-700 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      {isShipLoading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        "Check"
                      )}
                    </button>
                  </div>
                  {deliveryInfo && (
                    <p className="text-xs font-semibold text-teal-700 mt-3 flex items-center gap-2">
                      <Truck size={14} /> Expected Delivery: {deliveryInfo.etd}
                    </p>
                  )}
                </div>

                <div className="border border-zinc-200 rounded-md p-4 flex gap-3 text-zinc-600 mb-8 bg-zinc-50/50">
                  <RotateCcw size={20} className="shrink-0 text-zinc-800" />
                  <p className="text-xs leading-relaxed font-medium">
                    This product is eligible for return or exchange under our
                    7-day policy. No questions asked.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">
                    Product Story
                  </h4>
                  <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                    {singleProduct.description}
                  </p>
                </div>

                {/* Mobile Specs */}
                {singleProduct.fabricCare && (
                  <div className="mt-8 lg:hidden border-t border-zinc-100 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-4">
                      Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {singleProduct.fabricCare
                        .split("\n")
                        .map((line, index) => {
                          const parts = line.split(":");
                          if (parts.length < 2) return null;
                          return (
                            <div key={index} className="flex flex-col">
                              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                {parts[0].trim()}
                              </span>
                              <span className="font-bold text-black uppercase text-xs mt-0.5">
                                {parts[1].trim()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 🚀 RELATED PRODUCTS SECTION (Sirf ye add kiya hai) */}
            <RelatedProducts
              products={relatedProducts}
              currentCategory={singleProduct.category}
            />
          </main>

          {/* Sticky Mobile Add To Cart Button */}
          <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 p-3 flex gap-3 z-[100] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleAddToCart}
              disabled={!singleProduct.inStock || isCartLoading}
              className="flex-1 h-12 bg-[#E94A3F] text-white rounded-md font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-zinc-300"
            >
              {isCartLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>Add to Cart</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
