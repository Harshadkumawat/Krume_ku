const axios = require("axios");

// Yahan 4th parameter 'userName' add kiya hai
const syncOrderToShiprocket = async (order, token, userEmail, userName) => {
  try {
    const orderData = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: "Home",

      // 📝 BILLING DETAILS
      billing_customer_name: userName || "Krumeku Customer",
      billing_last_name: "",
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.postalCode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: userEmail,
      billing_phone: order.shippingAddress.phone,

      // 🚚 SHIPPING DETAILS (Invoice par print karne ke liye ye zaroori hai)
      shipping_is_billing: false,
      shipping_customer_name: userName || "Krumeku Customer",
      shipping_last_name: "",
      shipping_address: order.shippingAddress.address,
      shipping_city: order.shippingAddress.city,
      shipping_pincode: order.shippingAddress.postalCode,
      shipping_state: order.shippingAddress.state,
      shipping_country: "India",
      shipping_email: userEmail,
      shipping_phone: order.shippingAddress.phone,

      // 👕 ORDER ITEMS & TAX

      order_items: order.orderItems.map((item) => {
        // 1. Aapka base price (799 ya 839 jo bhi database mein hai)
        const basePrice = item.price;

        // 2. GST Rate (5 ya 12)
        const itemGstRate =
          item.pricing?.gstRate || (basePrice < 1000 ? 5 : 12);

        return {
          name: item.productName || "Krumeku Product",
          sku: item.product.toString(),
          units: item.quantity,

          // 🔥 FIX: Shiprocket ko 839 tabhi milega jab hum selling_price aur tax ka math clear rakhenge
          // Agar aapka item.price 839 hai, toh hum vahi bhej rahe hain
          selling_price: basePrice,
          tax: itemGstRate,
          hsn: "6109",
        };
      }),

      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalPrice,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.5,
    };

    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Shiprocket Order Sync Fail:",
      error.response?.data || error.message,
    );
  }
};

module.exports = syncOrderToShiprocket;
