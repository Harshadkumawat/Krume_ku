// Utils/calculatePricing.js

const getGstRate = (price) => (price < 1000 ? 5 : 12);

const calculatePricing = (product) => {
  const basePriceOriginal = Number(product?.price) || 0;
  const rawDiscount = Number(product?.discountPercent) || 0;
  const discountPercent = Math.min(100, Math.max(0, rawDiscount));

  if (!basePriceOriginal) {
    return {
      originalPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      discountPrice: 0,
      gstRate: 0,
      gstAmount: 0,
      basePrice: 0,
      finalPriceWithTax: 0,
    };
  }

  const discountAmount = Math.round(
    (basePriceOriginal * discountPercent) / 100,
  );

  const basePriceAfterDiscount = basePriceOriginal - discountAmount;
  const gstRate = getGstRate(basePriceAfterDiscount);
  const gstAmount = Math.round((basePriceAfterDiscount * gstRate) / 100);
  const finalPriceWithTax = basePriceAfterDiscount + gstAmount;

  return {
    originalPrice: basePriceOriginal,
    discountPercent,
    discountAmount,
    discountPrice: basePriceAfterDiscount,
    gstRate,
    gstAmount,
    basePrice: basePriceAfterDiscount,
    finalPriceWithTax,
  };
};

module.exports = calculatePricing;
module.exports.getGstRate = getGstRate;
