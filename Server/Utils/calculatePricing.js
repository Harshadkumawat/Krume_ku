const calculatePricing = (product) => {
  const finalPrice = Math.round(
    product.price - (product.price * product.discountPrice) / 100
  );

  const gstRate = finalPrice <= 1000 ? 5 : 12;
  const gstAmount = Math.round(finalPrice * (gstRate / 100));
  const finalPriceWithTax = Math.round(finalPrice + gstAmount);

  return {
    finalPrice,
    gstRate,
    gstAmount,
    finalPriceWithTax,
    pricingLabel: `₹${finalPriceWithTax} (Incl. Tax)`,
    discountAmount: product.price - finalPrice,
    discountPercentage: product.discountPrice,
  };
};

module.exports = calculatePricing;
