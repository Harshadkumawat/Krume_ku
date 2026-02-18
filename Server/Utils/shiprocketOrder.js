const axios = require("axios");

const syncOrderToShiprocket = async (order, token) => {
  try {
    const orderData = {
      order_id: order._id,
      order_date: order.createdAt,
      pickup_location: "Primary", 
      billing_customer_name: order.shippingAddress.fullName,
      billing_last_name: "",
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.zipCode,
      billing_state: order.shippingAddress.state,
      billing_country: "India",
      billing_email: order.user.email,
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.orderItems.map((item) => ({
        name: item.name,
        sku: item.sku || item.productId,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.totalPrice,
      length: 10, 
      width: 10,
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
