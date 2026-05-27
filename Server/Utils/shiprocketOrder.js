const axios = require("axios");
const { getGstRate } = require("./calculatePricing");

const syncOrderToShiprocket = async (order, token, userEmail, userName) => {
  try {
    const totalItems = order.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    const totalWeight = Math.max(0.5, totalItems * 0.5);

    const itemsPrice = Number(order.itemsPrice) || 0;
    const discountPrice = Number(order.discountPrice) || 0;
    const discountRatio = itemsPrice > 0 ? discountPrice / itemsPrice : 0;

    const orderItems = order.orderItems.map((item) => {
      const priceExclGst = Number(item.price) || 0;
      const qty = item.quantity || 1;
      const itemTotal = priceExclGst * qty;
      const itemDiscount = itemTotal * discountRatio;
      const itemTaxable = itemTotal - itemDiscount;
      const effectiveUnit = itemTaxable / qty;
      const gstRate = getGstRate(effectiveUnit);

      const sellingPrice = Math.round(effectiveUnit * (1 + gstRate / 100));

      return {
        name: item.productName || "Product",
        sku: item.product.toString(),
        units: qty,
        selling_price: sellingPrice,
        discount: "0",
        tax: gstRate,
        hsn: "6109",
      };
    });

    const orderData = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Home",

      billing_customer_name:
        order.shippingAddress.fullName || userName || "Krumeku Customer",
      billing_last_name: "",
      billing_address: order.shippingAddress.address || "",
      billing_address_2: order.shippingAddress.landmark || "",
      billing_city: order.shippingAddress.city || "",
      billing_pincode: String(order.shippingAddress.pincode || ""),
      billing_state: order.shippingAddress.state || "",
      billing_country: "India",
      billing_email: userEmail || "",
      billing_phone: String(order.shippingAddress.phone || ""),
      shipping_is_billing: true,

      order_items: orderItems,
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalPrice,

      length: 10,
      breadth: 10,
      height: Math.max(5, totalItems * 3),
      weight: totalWeight,
    };

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 },
    );

    return res.data;
  } catch (error) {
    console.error(
      "❌ Shiprocket Order Sync Fail:",
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return null;
  }
};

module.exports = syncOrderToShiprocket;
