/**
 * @file Utils/calculateBill.js
 * @description Cart-level billing calculator for Krumeku.
 *
 * Flow:
 *   items
 *     → Loop 1: collect per-item base prices (excl. GST)
 *     → coupon discount (applied on base price, pre-GST — CBIC Circular 92/11/2019)
 *     → taxableAmount = totalExclTax - discountAmount
 *     → Loop 2: GST re-evaluated per-item AFTER coupon
 *               (handles slab change: ₹1199 base → 12%, ₹959 after coupon → 5%)
 *     → shipping: free if (taxableAmount + finalGST) ≥ ₹1000
 *                 i.e. what customer actually pays before shipping ≥ threshold
 *     → finalTotal = taxableAmount + finalGST + shippingCharge
 *
 * Bugs fixed vs original:
 *   1. prod.pricing stale cache → always fresh calculatePricing(prod)
 *   2. GST rate fallback used unitPrice (discounted) → now uses prod.price (original)
 *   3. Weighted GST pre-coupon rate applied post-coupon → GST re-evaluated after coupon
 *      per item proportionally (slab can change after coupon discount)
 *   4. Shipping threshold checked on taxableAmount (pre-GST) → now checked on
 *      taxableAmount + finalGST (what customer pays) — correct UX behavior
 */

const calculatePricing = require("./calculatePricing");

/** Minimum order value (incl. GST, excl. shipping) for free delivery */
const SHIPPING_THRESHOLD = 1000;

/**
 * calculateBill — computes full order billing summary.
 *
 * @param {Array}  items  - Cart items: [{ product: { price, discountPercent, ... }, quantity }]
 * @param {object} coupon - Optional: { discountType: "percentage"|"flat", discountValue, maxDiscountAmount }
 * @returns {object} {
 *   totalItems,
 *   cartTotalExclTax,  — pre-coupon, pre-GST (sum of sell prices)
 *   discountAmount,    — coupon discount applied on base
 *   gstAmount,         — GST on post-coupon taxable amount (correct slab)
 *   shipping,          — 0 or ₹50
 *   finalTotal         — what customer pays
 * }
 */
const calculateBill = (items, coupon = null) => {
  let totalExclTax = 0; // Sum of per-item sell prices (post product-discount, pre-GST)
  let totalItems = 0; // Total quantity across all cart items

  /**
   * itemBreakdowns — stores per-item data needed for GST re-calculation in Loop 2.
   * We cannot compute final GST in Loop 1 because coupon discount amount
   * (and therefore effective unit price + GST slab) is not known until after Loop 1.
   */
  const itemBreakdowns = [];

  // ── Loop 1: collect base prices ───────────────────────────────────────────
  items.forEach((item) => {
    const prod = item.product;

    // Skip items with missing/invalid product data
    if (!prod || !prod.price) return;

    /**
     * Always recalculate fresh — never use prod.pricing (DB cache).
     * Stale cache can have wrong discountPrice or gstRate.
     * calculatePricing handles: product-level discount + GST rate on sell price.
     */
    const pricing = calculatePricing(prod);
    const unitPrice = Number(pricing.discountPrice) || Number(prod.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const itemTotal = unitPrice * quantity;

    totalExclTax += itemTotal;
    totalItems += quantity;

    // Store for Loop 2
    itemBreakdowns.push({ unitPrice, quantity, itemTotal });
  });

  // ── Coupon discount ────────────────────────────────────────────────────────
  /**
   * Coupon applied on totalExclTax (base sell prices, pre-GST).
   * Per CBIC Circular 92/11/2019: discount reduces taxable value, not final price.
   * GST is never charged on the discount amount.
   */
  let discountAmountRaw = 0;

  if (coupon) {
    const dValue = Number(coupon.discountValue || 0);

    if (coupon.discountType === "percentage") {
      discountAmountRaw = (totalExclTax * dValue) / 100;

      // Cap: e.g. "20% off, max ₹200" — prevent excessive discount on large carts
      if (coupon.maxDiscountAmount > 0) {
        discountAmountRaw = Math.min(
          discountAmountRaw,
          coupon.maxDiscountAmount,
        );
      }
    } else {
      // Flat discount: e.g. ₹100 off
      discountAmountRaw = dValue;
    }
  }

  // Clamp: discount cannot exceed cart total or go negative
  const discountAmount = Math.round(
    Math.min(Math.max(0, totalExclTax), Math.max(0, discountAmountRaw)),
  );

  // Post-coupon taxable base (pre-GST) — GST will be applied on this
  const taxableAmount = Math.max(0, totalExclTax - discountAmount);

  // ── Loop 2: GST re-evaluated per-item AFTER coupon ────────────────────────
  /**
   * Why re-evaluate here and not in Loop 1?
   * Coupon can push effective unit price across GST slab boundary.
   *
   * Example (single item):
   *   unitPrice (sell) = ₹1199 → GST slab = 12%
   *   coupon 20% off → effectiveUnit = ₹959 → GST slab = 5%  ← slab changed!
   *   GST = 5% of ₹959 = ₹48  (not 12% of ₹959 = ₹115)
   *
   * For mixed carts: coupon discount is split proportionally across items
   * (by their share of totalExclTax), then each item's slab is re-checked.
   */
  let finalGST = 0;

  if (totalExclTax > 0) {
    // Ratio of total discount to total base — applied proportionally per item
    const discountRatio = discountAmount / totalExclTax;

    itemBreakdowns.forEach(({ unitPrice, quantity, itemTotal }) => {
      // This item's proportional share of the coupon discount
      const itemDiscount = itemTotal * discountRatio;
      const itemTaxableTotal = itemTotal - itemDiscount; // post-coupon base for this item

      // Effective per-unit price after coupon → determines GST slab
      const effectiveUnitPrice = itemTaxableTotal / quantity;
      const itemGstRate = (effectiveUnitPrice < 1000 ? 5 : 12) / 100;
      const itemGST = Math.round(itemTaxableTotal * itemGstRate);

      finalGST += itemGST;
    });
  }

  // ── Shipping ───────────────────────────────────────────────────────────────
  /**
   * Threshold checked on (taxableAmount + finalGST) — what customer actually pays
   * before shipping. NOT on taxableAmount alone (pre-GST).
   *
   * Why: Customer paying ₹1007 (₹959 base + ₹48 GST) should get free delivery
   * even though base was ₹959 < ₹1000.
   */
  const priceBeforeShipping = taxableAmount + finalGST;
  const shippingCharge =
    priceBeforeShipping >= SHIPPING_THRESHOLD || totalItems === 0 ? 0 : 50;

  // ── Final total ────────────────────────────────────────────────────────────
  const finalTotal = Math.round(priceBeforeShipping + shippingCharge);

  return {
    totalItems,
    cartTotalExclTax: Math.round(totalExclTax), // Pre-coupon, pre-GST
    discountAmount, // Coupon discount (on base)
    gstAmount: finalGST, // GST after coupon (correct slab)
    shipping: shippingCharge, // 0 or ₹50
    finalTotal, // What customer pays
  };
};

module.exports = { calculateBill, SHIPPING_THRESHOLD };
