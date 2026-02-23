const asyncHandler = require("express-async-handler");
const Order = require("../Models/orderModel");
const Product = require("../Models/ProductSchema");
const Coupon = require("../Models/couponModel");
const sendOrderEmail = require("../Utils/sendEmail");
const { getShiprocketToken } = require("./shippingController");
const syncOrderToShiprocket = require("../Utils/shiprocketOrder");
const axios = require("axios");

// -------------------- 1. ADMIN ANALYTICS --------------------
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
    { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },
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

// -------------------- 2. ORDER MANAGEMENT --------------------
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
    isPaid,
    paidAt,
    paymentResult,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ success: false, message: "No order items" });
  }

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
    isPaid: isPaid || false,
    paidAt: paidAt || null,
    paymentResult: paymentResult || {},
  });

  const createdOrder = await order.save();

  // 🔥 UPDATE STOCK & Bestseller (soldCount)
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(0, product.countInStock - item.quantity);
      product.soldCount = (product.soldCount || 0) + item.quantity; // 🔥 Naya jadoo: Bestseller Tracking

      const sizeIndex = product.sizes.findIndex((s) => s.label === item.size);
      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock = Math.max(
          0,
          product.sizes[sizeIndex].stock - item.quantity,
        );
      }
      await product.save();
    }
  }

  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode.toUpperCase() },
      { $inc: { usedCount: 1 }, $push: { usersUsed: req.user._id } },
    );
  }

  res.status(201).json(createdOrder);

  // Background Tasks
  (async () => {
    try {
      const token = await getShiprocketToken();
      if (token) {
        const shiprocketRes = await syncOrderToShiprocket(
          createdOrder,
          token,
          req.user.email,
          req.user.fullName,
        );
        if (shiprocketRes) {
          createdOrder.shiprocketOrderId = shiprocketRes.order_id;
          createdOrder.shiprocketShipmentId = shiprocketRes.shipment_id;
          await createdOrder.save();
        }
      }
    } catch (error) {
      console.error("⚠️ Shiprocket Sync Failed:", error.message);
    }
  })();

  (async () => {
    try {
      const orderDetails = {
        orderId: createdOrder._id.toString(),
        totalAmount: createdOrder.totalPrice,
        address: `${createdOrder.shippingAddress.address}, ${createdOrder.shippingAddress.city} - ${createdOrder.shippingAddress.postalCode}`,
        items: createdOrder.orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size || "N/A",
        })),
      };
      await sendOrderEmail(req.user.email, orderDetails);
    } catch (error) {
      console.error("⚠️ Email Error:", error.message);
    }
  })();
});

// -------------------- 3. RETURN & EXCHANGE --------------------
const requestReturn = asyncHandler(async (req, res) => {
  const { reason, comments, type } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  if (order.orderStatus !== "Delivered") {
    return res
      .status(400)
      .json({
        success: false,
        message: "Order must be delivered to initiate return",
      });
  }

  const deliveryDate = new Date(order.deliveredAt);
  const diffDays = Math.ceil(
    Math.abs(new Date() - deliveryDate) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 7) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Return window closed (7 days exceeded)",
      });
  }

  if (order.returnInfo && order.returnInfo.isReturnRequested) {
    return res
      .status(400)
      .json({ success: false, message: "Return request already submitted" });
  }

  order.returnInfo = {
    isReturnRequested: true,
    reason,
    comments,
    type: type
      ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      : "Refund",
    requestedAt: Date.now(),
    status: "Pending",
  };

  order.orderStatus = "Return Requested";
  await order.save();
  res.status(200).json({ success: true, message: "Return Request Initiated" });
});

const handleReturnStatus = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  order.returnInfo.status = status;
  if (adminComment) order.returnInfo.adminComment = adminComment;

  if (status === "Approved") {
    order.orderStatus = "Return Approved";

    if (order.shiprocketOrderId) {
      try {
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
          pickup_email: "admin@krumeku.com",
          pickup_phone: order.shippingAddress.phone,
          order_items: order.orderItems.map((item) => ({
            name: item.productName || item.name,
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
        order.returnInfo.shiprocketReturnId = response.data.return_order_id;
      } catch (error) {
        console.error("❌ Shiprocket Return API Failed:", error.message);
      }
    }
  } else if (status === "Refunded") {
    order.orderStatus = "Returned";
    order.isPaid = false;

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.quantity;
        product.soldCount = Math.max(
          0,
          (product.soldCount || 0) - item.quantity,
        ); // 🔥 Return hone par bestseller se minus bhi karo

        const sizeIndex = product.sizes.findIndex((s) => s.label === item.size);
        if (sizeIndex !== -1) {
          product.sizes[sizeIndex].stock += item.quantity;
        }
        await product.save();
      }
    }
  } else if (status === "Rejected") {
    order.orderStatus = "Delivered";
  }

  await order.save();
  res.status(200).json({ success: true, message: `Return request ${status}` });
});

// -------------------- 4. STANDARD CONTROLLERS --------------------
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  const newStatus = req.body.status || req.body.orderStatus;
  if (order.orderStatus === "Cancelled") {
    return res
      .status(400)
      .json({ success: false, message: "Cannot update cancelled order" });
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
  else res.status(404).json({ success: false, message: "Order not found" });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  if (order.orderStatus !== "Processing") {
    return res
      .status(400)
      .json({
        success: false,
        message: "Cannot cancel shipped/delivered orders",
      });
  }

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.quantity;
      product.soldCount = Math.max(0, (product.soldCount || 0) - item.quantity); // 🔥 Cancel hone par bestseller se minus

      const sizeIndex = product.sizes.findIndex((s) => s.label === item.size);
      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock += item.quantity;
      }
      await product.save();
    }
  }

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
  res
    .status(200)
    .json({ success: true, message: "Order cancelled successfully" });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });
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
