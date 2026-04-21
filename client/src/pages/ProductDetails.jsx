import React, {
  useEffect,
  useState,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Truck,
  RotateCcw,
  Scissors,
  Droplets,
  ChevronDown,
  ChevronUp,
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
import SEO from "../components/SEO";
import RelatedProducts from "../components/singleProduct/RelatedProducts";
import { DetailsSkeleton } from "../components/Skeletons";
import { formatPrice } from "../utils/formatters";
import Button from "../components/ui/Button";

// ✅ OPT 1: parseFabricLine is a pure function — no need for useCallback.
// Moved to module level so it's created once, not on every render.
const parseFabricLine = (line) => {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  return {
    label: line.slice(0, idx).trim(),
    value: line.slice(idx + 1).trim(),
  };
};

// ✅ OPT 2: buildJsonLd extracted to module level — pure function, no closure needed.
const buildJsonLd = (product, id) => {
  if (!product) return null;
  return JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.productName,
    image: product.images?.[0]?.secure_url || product.images?.[0]?.url,
    description: product.description,
    brand: { "@type": "Brand", name: "Krumeku" },
    offers: {
      "@type": "Offer",
      url: `https://www.krumeku.com/product/${id}`,
      priceCurrency: "INR",
      price:
        product.pricing?.finalPriceWithTax ??
        product.finalPriceWithTax ??
        product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  });
};

// ✅ OPT 3: Initial selection state as a constant — avoids recreating object on every render.
const INITIAL_SELECTION = { size: "", color: "", quantity: 1 };

const ProductSelectors = lazy(
  () => import("../components/singleProduct/ProductSelectors"),
);

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { singleProduct, relatedProducts, isLoading, isError } = useSelector(
    (s) => s.products,
  );
  const { isLoading: isCartLoading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { wishlistItems } = useSelector((s) => s.wishlist);
  const { deliveryInfo, isLoading: isShipLoading } = useSelector(
    (s) => s.shipping,
  );

  // ✅ OPT 4: size, color, quantity grouped into one state object.
  // These 3 always reset together on product change — grouping makes that explicit.
  const [selection, setSelection] = useState(INITIAL_SELECTION);
  const [pincode, setPincode] = useState("");
  const [isCareOpen, setIsCareOpen] = useState(false);

  // ✅ OPT 5: Redirect logic separated into its own effect.
  // Previously both redirect + data fetch were in one effect — hard to reason about.
  useEffect(() => {
    if (location.pathname.startsWith("/item/")) {
      navigate(location.pathname.replace("/item/", "/product/"), {
        replace: true,
      });
    }
  }, [location.pathname, navigate]);

  // ✅ OPT 6: Data fetch effect — clean, only runs when id changes.
  useEffect(() => {
    if (!id) return;
    dispatch(getSingleProduct(id));
    dispatch(resetShipping());
    setSelection(INITIAL_SELECTION); // single reset instead of 3 separate setStates
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, id]);

  const handleWishlist = useCallback(() => {
    if (!user) {
      toast.info("Please login to save items to your archive.");
      return navigate("/login");
    }
    dispatch(addToWishlist(singleProduct?._id));
  }, [user, dispatch, singleProduct?._id, navigate]);

  const handleAddToCart = useCallback(() => {
    if (singleProduct?.sizes?.length > 0 && !selection.size)
      return toast.error("Please select a size.");
    if (singleProduct?.colors?.length > 0 && !selection.color)
      return toast.error("Please select a color.");

    dispatch(
      addToCart({
        productId: singleProduct._id,
        quantity: selection.quantity,
        size: selection.size || "One Size",
        color: selection.color || "Default",
      }),
    )
      .unwrap()
      .then(() => toast.success("Item added to your bag."))
      .catch((err) => toast.error(err));
  }, [singleProduct, selection, dispatch]);

  const toggleCare = useCallback(() => setIsCareOpen((o) => !o), []);

  // ✅ OPT 7: handleQuantity now uses grouped state — single updater instead of dedicated setter.
  const handleQuantity = useCallback((type) => {
    setSelection((prev) => ({
      ...prev,
      quantity:
        type === "inc"
          ? Math.min(prev.quantity + 1, 10)
          : Math.max(prev.quantity - 1, 1),
    }));
  }, []);

  // ✅ OPT 8: handlePincodeCheck extracted — both keydown and button click use same fn.
  // Previously logic was duplicated across two handlers.
  const handlePincodeCheck = useCallback(() => {
    if (pincode.length === 6) dispatch(getShippingDetails(pincode));
    else toast.error("Enter valid pincode");
  }, [pincode, dispatch]);

  const handlePincodeKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handlePincodeCheck();
    },
    [handlePincodeCheck],
  );

  const isWishlisted = useMemo(
    () =>
      wishlistItems?.some(
        (item) =>
          item._id === singleProduct?._id ||
          item.product === singleProduct?._id,
      ),
    [wishlistItems, singleProduct?._id],
  );

  // ✅ OPT 9: useMemo now calls the pure module-level buildJsonLd — cleaner.
  const jsonLd = useMemo(
    () => buildJsonLd(singleProduct, id),
    [singleProduct, id],
  );

  const finalPrice =
    singleProduct?.pricing?.finalPriceWithTax ??
    singleProduct?.finalPriceWithTax ??
    singleProduct?.price;

  const baseTitle = isLoading
    ? "Loading Piece..."
    : singleProduct?.productName || "Piece Not Found";

  const seoImage =
    singleProduct?.images?.[0]?.secure_url || singleProduct?.images?.[0]?.url;

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-white min-h-screen">
        <DetailsSkeleton />
      </div>
    );
  }

  if (isError || !singleProduct) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center pt-20">
        <h2 className="text-xl font-black uppercase italic mb-4 text-zinc-400">
          Piece Not Found
        </h2>
        <Link
          to="/products"
          className="text-[10px] font-black tracking-widest uppercase border-b-2 border-black pb-1 outline-none"
        >
          Back to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white pb-20 lg:pb-0">
      <SEO
        title={`Buy ${baseTitle}`}
        description={singleProduct.description?.substring(0, 160)}
        image={seoImage}
        url={`https://www.krumeku.com/product/${id}`}
        type="product"
      />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}

      <div className="pb-24 lg:pb-10 pt-20 md:pt-24 animate-in fade-in duration-500">
        {/* BREADCRUMBS */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mb-4 lg:mb-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
          >
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/products?category=${singleProduct.category}`}
              className="hover:text-black transition-colors"
            >
              {singleProduct.category}
            </Link>
            <span aria-hidden="true">/</span>
            <span
              className="text-black truncate max-w-[150px]"
              aria-current="page"
            >
              {singleProduct.productName}
            </span>
          </nav>
        </div>

        <main className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* GALLERY */}
            <div className="w-full lg:w-[60%] xl:w-[65%]">
              <ProductGallery
                images={singleProduct.images}
                productName={singleProduct.productName}
              />

              {/* DESKTOP FABRIC CARE */}
              {singleProduct.fabricCare && (
                <div className="mt-10 hidden lg:block border-t border-zinc-100 pt-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black mb-6">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">
                    {singleProduct.fabricCare.split("\n").map((line, index) => {
                      const parsed = parseFabricLine(line);
                      if (!parsed) return null;
                      return (
                        <div
                          key={index}
                          className="flex flex-col border-b border-zinc-100 pb-2"
                        >
                          <span className="text-zinc-500 font-medium mb-1">
                            {parsed.label}
                          </span>
                          <span className="font-bold text-black uppercase">
                            {parsed.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT INFO SIDEBAR */}
            <div className="w-full lg:w-[40%] xl:w-[35%] lg:sticky lg:top-24">
              <div className="mb-6 border-b border-zinc-100 pb-6">
                {singleProduct.category === "Embroidery" && (
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-red-600 mb-3 bg-red-50 w-fit px-2 py-1 rounded-sm">
                    <Scissors size={12} aria-hidden="true" /> Crafted In-House
                  </div>
                )}
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 leading-tight mb-2">
                  {singleProduct.productName}
                </h1>
                <p className="text-sm font-medium text-zinc-500 mb-4">
                  {singleProduct.subCategory || singleProduct.category}
                </p>

                <div className="flex items-end gap-3 mb-1">
                  <span className="text-2xl font-black text-black">
                    {formatPrice(finalPrice)}
                  </span>
                  {singleProduct.discountPercent > 0 && (
                    <span className="text-base text-zinc-400 line-through font-bold mb-0.5">
                      {formatPrice(singleProduct.price)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-teal-600">
                  Price incl. of all taxes
                </p>
              </div>

              {/* SELECTORS */}
              <div className="mb-8">
                <Suspense
                  fallback={
                    <div
                      className="h-40 bg-zinc-50 animate-pulse rounded-xl"
                      aria-hidden="true"
                    />
                  }
                >
                  <ProductSelectors
                    colors={singleProduct.colors}
                    sizes={singleProduct.sizes}
                    selectedColor={selection.color}
                    setSelectedColor={(color) =>
                      setSelection((prev) => ({ ...prev, color }))
                    }
                    selectedSize={selection.size}
                    setSelectedSize={(size) =>
                      setSelection((prev) => ({ ...prev, size }))
                    }
                    quantity={selection.quantity}
                    handleQuantity={handleQuantity}
                  />
                </Suspense>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="danger"
                  className="flex-[2] h-14 bg-[#E94A3F] border-none text-white hover:bg-[#d43a30]"
                  onClick={handleAddToCart}
                  disabled={!singleProduct.inStock}
                  isLoading={isCartLoading}
                >
                  {singleProduct.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button
                  type="button"
                  variant={isWishlisted ? "danger" : "outline"}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  className={`flex-[1] h-14 flex items-center justify-center gap-2 border ${
                    isWishlisted
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "border-zinc-200 text-black hover:bg-zinc-50"
                  }`}
                  onClick={handleWishlist}
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-red-600" : ""}
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>

              {/* PINCODE */}
              <div className="mb-8">
                <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-3">
                  Delivery Details
                </h2>
                <div className="flex h-12 bg-white border border-zinc-200 rounded-xl overflow-hidden focus-within:border-black transition-colors">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    aria-label="Enter 6 digit pincode"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={handlePincodeKeyDown}
                    placeholder="Enter Pincode"
                    className="flex-1 px-4 text-sm font-medium outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-none h-full bg-zinc-100 text-teal-700 hover:bg-zinc-200"
                    onClick={handlePincodeCheck}
                    isLoading={isShipLoading}
                  >
                    Check
                  </Button>
                </div>
                {deliveryInfo && (
                  <p
                    className="text-xs font-semibold text-teal-700 mt-3 flex items-center gap-2 animate-in fade-in"
                    aria-live="polite"
                  >
                    <Truck size={14} aria-hidden="true" /> Expected Delivery:{" "}
                    {deliveryInfo.etd}
                  </p>
                )}
              </div>

              {/* CARE ACCORDION */}
              <div className="mb-8 border border-zinc-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={toggleCare}
                  aria-expanded={isCareOpen}
                  aria-controls="care-panel"
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors outline-none"
                >
                  <div className="flex items-center gap-2 text-black font-bold uppercase tracking-widest text-xs">
                    <Droplets size={16} aria-hidden="true" /> Wash & Care Rules
                  </div>
                  {isCareOpen ? (
                    <ChevronUp size={16} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} aria-hidden="true" />
                  )}
                </button>

                {isCareOpen && (
                  <div
                    id="care-panel"
                    className="p-4 bg-white text-xs font-medium text-zinc-600 leading-relaxed space-y-3 animate-in fade-in slide-in-from-top-2"
                  >
                    <p>Our premium apparel requires premium care:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Wash inside out</strong> with cold water.
                      </li>
                      <li>Do not use bleach or harsh detergents.</li>
                      {singleProduct.category === "Embroidery" && (
                        <li className="text-red-600 font-bold">
                          Never iron directly on the embroidery. Iron inside
                          out.
                        </li>
                      )}
                      <li>Tumble dry low or hang dry in the shade.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="border border-zinc-200 rounded-xl p-4 flex gap-3 text-zinc-600 mb-8 bg-zinc-50/50">
                <RotateCcw
                  size={20}
                  className="shrink-0 text-zinc-800"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed font-medium">
                  This product is eligible for return or exchange under our
                  7-day policy. No questions asked.
                </p>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-3">
                  Product Story
                </h2>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  {singleProduct.description}
                </p>
              </div>

              {/* MOBILE FABRIC CARE */}
              {singleProduct.fabricCare && (
                <div className="mt-8 lg:hidden border-t border-zinc-100 pt-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-black mb-4">
                    Specifications
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {singleProduct.fabricCare.split("\n").map((line, index) => {
                      const parsed = parseFabricLine(line);
                      if (!parsed) return null;
                      return (
                        <div key={index} className="flex flex-col">
                          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            {parsed.label}
                          </span>
                          <span className="font-bold text-black uppercase text-xs mt-0.5">
                            {parsed.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <RelatedProducts
            products={relatedProducts}
            currentCategory={singleProduct.category}
          />
        </main>

        {/* MOBILE STICKY BOTTOM */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 p-3 flex gap-3 z-[100] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <Button
            variant="danger"
            className="flex-1 h-12 bg-[#E94A3F] border-none text-white hover:bg-[#d43a30]"
            onClick={handleAddToCart}
            disabled={!singleProduct.inStock}
            isLoading={isCartLoading}
          >
            {singleProduct.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
