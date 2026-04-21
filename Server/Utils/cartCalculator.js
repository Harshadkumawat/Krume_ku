const calculatePricing = require("./calculatePricing");

const SHIPPING_THRESHOLD = 1000;

const calculateBill = (items, coupon = null) => {
  let totalExclTax = 0;
  let totalGST = 0;
  let totalItems = 0;

  items.forEach((item) => {
    const prod = item.product;
    if (!prod || !prod.price) return;

    const pricing = prod.pricing || calculatePricing(prod);

    const unitPrice = Number(pricing.discountPrice || prod.price || 0);
    const quantity = Number(item.quantity) || 1;

    const gstRate = pricing.gstRate || (unitPrice < 1000 ? 5 : 12);
    const itemGstRate = gstRate / 100;

    const itemTotalExclTax = unitPrice * quantity;
    const itemGST = Math.round(itemTotalExclTax * itemGstRate);

    totalExclTax += itemTotalExclTax;
    totalGST += itemGST;
    totalItems += quantity;
  });

  // ── Coupon Discount Logic ───────────────────────────────
  let discountAmountRaw = 0;
  if (coupon) {
    const dValue = Number(coupon.discountValue || 0);

    if (coupon.discountType === "percentage") {
      discountAmountRaw = (totalExclTax * dValue) / 100;

      // Cap at maxDiscountAmount (if set)
      if (coupon.maxDiscountAmount > 0) {
        discountAmountRaw = Math.min(
          discountAmountRaw,
          coupon.maxDiscountAmount,
        );
      }
    } else {
      discountAmountRaw = dValue;
    }
  }

  // Discount cannot exceed cart total, and cannot be negative
  const discountAmount = Math.round(
    Math.min(Math.max(0, totalExclTax), Math.max(0, discountAmountRaw)),
  );

  // ── Taxable Amount ─────────────────────────────────────
  // Discount applied BEFORE tax (as per Indian GST rules)
  const taxableAmount = Math.max(0, totalExclTax - discountAmount);

  // ── Weighted GST ───────────────────────────────────────
  const effectiveGstRate = totalExclTax > 0 ? totalGST / totalExclTax : 0;
  const finalGST = Math.round(taxableAmount * effectiveGstRate);

  // ── Shipping ───────────────────────────────────────────
  const shippingCharge =
    taxableAmount >= SHIPPING_THRESHOLD || totalItems === 0 ? 0 : 50;

  // ── Final Total ────────────────────────────────────────
  const finalTotal = Math.round(taxableAmount + finalGST + shippingCharge);

  return {
    totalItems,
    cartTotalExclTax: Math.round(totalExclTax),
    discountAmount,
    gstAmount: finalGST,
    shipping: shippingCharge,
    finalTotal,
  };
};

module.exports = { calculateBill, SHIPPING_THRESHOLD };
