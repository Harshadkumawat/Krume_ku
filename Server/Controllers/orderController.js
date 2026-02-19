const asyncHandler = require("express-async-handler");
const Order = require("../Models/orderModel");
const Product = require("../Models/ProductSchema");
const Coupon = require("../Models/couponModel");
const sendOrderEmail = require("../Utils/sendEmail");
const { getShiprocketToken } = require("./shippingController");
const syncOrderToShiprocket = require("../Utils/shiprocketOrder");
const axios = require("axios");

// ------------------------------------------------------------------
// 📊 ADMIN ANALYTICS
// ------------------------------------------------------------------
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const { range = "daily" } = req.query;
  let groupFormat, matchDate;

  if (range === "daily") {
    groupFormat = "%Y-%m-%d";
    matchDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "weekly") {
    groupFormat = "%U";
    matchDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  } else if (range === "monthly") {
    groupFormat = "%Y-%m";
    matchDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: matchDate },
        orderStatus: { $nin: ["Cancelled", "Returned"] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalSales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        orderStatus: { $nin: ["Cancelled", "Returned"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const totalOrders = await Order.countDocuments();
  const returnRequests = await Order.countDocuments({
    "returnInfo.status": "Pending",
  });

  const lowStockProducts = await Product.find({
    countInStock: { $lte: 5 },
    inStock: true,
  }).select("productName countInStock images category");

  const latestOrders = await Order.find({})
    .populate("user", "fullName email")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      salesData,
      lowStockProducts,
      latestOrders,
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      returnRequests,
    },
  });
});

// ------------------------------------------------------------------
// 📦 ORDER MANAGEMENT
// ------------------------------------------------------------------

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // 1. Create Order
  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode,
  });

  const createdOrder = await order.save();

  // 2. Reduce Stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.quantity },
    });
  }

  // 3. Update Coupon Usage
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode.toUpperCase() },
      { $inc: { usedCount: 1 }, $push: { usersUsed: req.user._id } },
    );
  }

  // 🔥 FAST WORK FIX: Pehle Response bhejo, User ko wait mat karao
  res.status(201).json(createdOrder);

  // ---------------------------------------------------------
  // ⚡ BACKGROUND TASKS (Ab ye user ko block nahi karenge)
  // ---------------------------------------------------------

  // 4. Shiprocket Sync (Background)
  (async () => {
    try {
      const token = await getShiprocketToken();
      if (token) {
        const shiprocketRes = await syncOrderToShiprocket(createdOrder, token);
        if (shiprocketRes) {
          createdOrder.shiprocketOrderId = shiprocketRes.order_id;
          createdOrder.shiprocketShipmentId = shiprocketRes.shipment_id;
          await createdOrder.save();
          console.log(
            "✅ Shiprocket Order Created ID:",
            shiprocketRes.order_id,
          );
        }
      }
    } catch (error) {
      console.error("⚠️ Shiprocket Sync Skipped/Failed:", error.message);
    }
  })();

  // 5. Send Email (Background)
  (async () => {
    try {
      const orderDetails = {
        orderId: createdOrder._id.toString(),
        totalAmount: createdOrder.totalPrice,
        address: `${shippingAddress.address || shippingAddress.street}, ${shippingAddress.city}`,
      };
      await sendOrderEmail(req.user.email, orderDetails);
    } catch (error) {
      console.error("⚠️ Email Error:", error.message);
    }
  })();
});

// ------------------------------------------------------------------
// 🔄 RETURN & EXCHANGE LOGIC
// ------------------------------------------------------------------

const requestReturn = asyncHandler(async (req, res) => {
  const { reason, comments, type } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 1. Validation: Must be delivered first
  if (order.orderStatus !== "Delivered") {
    res.status(400);
    throw new Error("Order must be delivered to initiate return");
  }

  // 2. Validation: 7-Day Window
  const deliveryDate = new Date(order.deliveredAt);
  const currentDate = new Date();
  const diffDays = Math.ceil(
    Math.abs(currentDate - deliveryDate) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 7) {
    res.status(400);
    throw new Error("Return window closed (7 days exceeded)");
  }

  // 3. Validation: Already Requested
  if (order.returnInfo && order.returnInfo.isReturnRequested) {
    res.status(400);
    throw new Error("Return request already submitted");
  }

  let formattedType = "Refund";
  if (type) {
    formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // 4. Update DB
  order.returnInfo = {
    isReturnRequested: true,
    reason,
    comments,
    type: formattedType,
    requestedAt: Date.now(),
    status: "Pending",
  };

  order.orderStatus = "Return Requested";
  await order.save();

  res.status(200).json({ success: true, message: "Return Request Initiated" });
});

// 🔥 ADMIN HANDLER
const handleReturnStatus = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.returnInfo.status = status;
  if (adminComment) order.returnInfo.adminComment = adminComment;

  // --- LOGIC ---
  if (status === "Approved") {
    order.orderStatus = "Return Approved";

    // 🚀 SHIPROCKET REVERSE PICKUP (Auto)
    if (order.shiprocketOrderId) {
      try {
        console.log("🚚 Attempting to create Shiprocket Reverse Pickup...");
        const token = await getShiprocketToken();

        const returnPayload = {
          order_id: order.shiprocketOrderId,
          order_date: order.createdAt.toISOString().split("T")[0],
          pickup_customer_name:
            order.shippingAddress.fullName || order.user.fullName,
          pickup_address: order.shippingAddress.address,
          pickup_city: order.shippingAddress.city,
          pickup_state: order.shippingAddress.state || "",
          pickup_country: "India",
          pickup_pincode: order.shippingAddress.postalCode,
          pickup_email: "admin@krumeku.com", // Valid Email required usually
          pickup_phone: order.shippingAddress.phone,
          order_items: order.orderItems.map((item) => ({
            name: item.productName || item.name, // 🔥 BUG FIX: item.name undefined ho sakta hai
            sku: item.product.toString(),
            units: item.quantity,
            selling_price: item.price,
          })),
          payment_method: "Prepaid",
          sub_total: order.totalPrice,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
        };

        const response = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/orders/create/return",
          returnPayload,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        console.log(
          "✅ Shiprocket Return Created ID:",
          response.data.return_order_id,
        );
        order.returnInfo.shiprocketReturnId = response.data.return_order_id;
      } catch (error) {
        console.error(
          "❌ Shiprocket Return API Failed:",
          error.response?.data || error.message,
        );
      }
    } else {
      console.log(
        "⚠️ No Shiprocket Order ID found (Local Order), skipping API call.",
      );
    }
  } else if (status === "Refunded") {
    order.orderStatus = "Returned";
    order.isPaid = false;

    // Restock (Stock wapas add karna)
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: item.quantity },
      });
    }
  } else if (status === "Rejected") {
    order.orderStatus = "Delivered";
  }

  await order.save();
  res.status(200).json({ success: true, message: `Return request ${status}` });
});

// ------------------------------------------------------------------
// 🛠️ STANDARD CONTROLLERS
// ------------------------------------------------------------------

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const newStatus = req.body.status || req.body.orderStatus;

  if (order.orderStatus === "Cancelled") {
    res.status(400);
    throw new Error("Cannot update cancelled order");
  }

  order.orderStatus = newStatus;

  if (newStatus === "Delivered") {
    order.deliveredAt = Date.now();
    order.isDelivered = true;
    order.isPaid = true;
  }

  await order.save();
  res.status(200).json({ success: true, data: order });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "fullName email phone",
  );
  if (order) res.json(order);
  else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.orderStatus !== "Processing") {
    res.status(400);
    throw new Error("Cannot cancel shipped/delivered orders");
  }

  // Restock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: item.quantity },
    });
  }

  // Shiprocket Cancel
  if (order.shiprocketOrderId) {
    try {
      const token = await getShiprocketToken();
      await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/cancel",
        { ids: [order.shiprocketOrderId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("⚠️ Shiprocket Cancel Error:", error.message);
    }
  }

  order.orderStatus = "Cancelled";
  await order.save();
  res.status(200).json({ success: true, message: "Order cancelled" });
});

// 🔥 ADMIN: GET ALL ORDERS
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });

  // Frontend Redux expects: action.payload.data
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.deleteOne();
  res.status(200).json({ success: true, message: "Order Removed" });
});

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAdminDashboardStats,
  requestReturn,
  handleReturnStatus,
};
