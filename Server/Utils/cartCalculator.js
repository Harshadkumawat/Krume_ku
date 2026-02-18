const calculateBill = (items, coupon = null) => {
  let totalExclTax = 0;
  let totalGST = 0;
  let totalItems = 0;

  items.forEach((item) => {
    if (item.product) {
      const unitPrice = Number(
        item.product.discountPrice || item.product.price,
      );
      const quantity = Number(item.quantity);

      const itemGstRate = unitPrice < 1000 ? 0.05 : 0.12;

      const itemTotalExclTax = unitPrice * quantity;
      const itemGST = itemTotalExclTax * itemGstRate;

      totalExclTax += itemTotalExclTax;
      totalGST += itemGST;
      totalItems += quantity;
    }
  });

  // 2. Discount Calculation
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((totalExclTax * coupon.discountAmount) / 100);
    } else {
      discountAmount = Number(coupon.discountAmount);
    }
  }

  // 3. Taxable Amount

  const taxableAmount = totalExclTax - discountAmount;

  const effectiveGstRate = totalExclTax > 0 ? totalGST / totalExclTax : 0;
  const finalGST = taxableAmount * effectiveGstRate;

  // 4. Shipping Logic
  const SHIPPING_THRESHOLD = 1000;
  const shippingCharge =
    totalExclTax >= SHIPPING_THRESHOLD || totalExclTax === 0 ? 0 : 50;

  // 5. Final Total
  const finalTotal = taxableAmount + finalGST + shippingCharge;

  return {
    totalItems,
    cartTotalExclTax: Math.round(totalExclTax),
    discountAmount: Math.round(discountAmount),
    gstAmount: Math.round(finalGST),
    shipping: shippingCharge,
    finalTotal: Math.round(finalTotal),
  };
};

module.exports = { calculateBill };
