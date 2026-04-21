const axios = require("axios");

const syncOrderToShiprocket = async (order, token, userEmail, userName) => {
  try {
    const totalItems = order.orderItems.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
    const totalWeight = Math.max(0.5, totalItems * 0.5);

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

      order_items: order.orderItems.map((item) => {
        const basePrice = Number(item.price) || 0;
        const gstRate = basePrice < 1000 ? 5 : 12;

        const taxMultiplier = 1 + gstRate / 100;
        const priceExclTax = parseFloat((basePrice / taxMultiplier).toFixed(2));

        return {
          name: item.productName || "Product",
          sku: item.product.toString(),
          units: item.quantity,
          selling_price: priceExclTax,
          tax: gstRate,
          hsn: "6109",
        };
      }),

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
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      },
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
