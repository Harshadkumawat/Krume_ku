const calculatePricing = (product) => {
  const originalPrice = Number(product.price) || 0;
  const discountPercent = Number(product.discountPercent) || 0;

  const discountAmountRaw = (originalPrice * discountPercent) / 100;
  const discountPrice = Math.round(originalPrice - discountAmountRaw);

  const gstRate = discountPrice <= 1000 ? 5 : 12;

  const gstAmount = Math.round(discountPrice * (gstRate / 100));

  const finalPriceWithTax = discountPrice + gstAmount;

  return {
    originalPrice,
    discountPercent,
    discountPrice,
    gstRate,
    gstAmount,
    finalPriceWithTax,
    discountAmount: originalPrice - discountPrice,
  };
};

module.exports = calculatePricing;
