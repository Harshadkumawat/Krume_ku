const asyncHandler = require("express-async-handler");
const Order = require("../Models/orderModel");
const Product = require("../Models/ProductSchema");
const User = require("../Models/userSchema");
const Coupon = require("../Models/couponModel");
const Cart = require("../Models/CartSchema");
const { ApiError } = require("../Middleware/errorMiddleware");
const sendOrderEmail = require("../Utils/sendEmail");
const { getShiprocketToken } = require("./shippingController");
const syncOrderToShiprocket = require("../Utils/shiprocketOrder");
const axios = require("axios");
const { calculateBill } = require("../Utils/cartCalculator");
const calculatePricing = require("../Utils/calculatePricing");

const PRODUCT_SELECT =
  "productName price discountPercent discountPrice discountAmount gstRate gstAmount finalPriceWithTax images category subCategory colors sizes countInStock inStock";

const VALID_TRANSITIONS = {
  Processing: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: ["Return Requested"],
  "Return Requested": ["Return Approved", "Delivered"],
  "Return Approved": ["Returned"],
  Cancelled: [],
  Returned: [],
};

const USER_CANCELLABLE = ["Processing", "Confirmed"];

const updateProductStock = async (orderItems, action = "decrease") => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const qty = item.quantity;

    if (action === "decrease") {
      product.soldCount = (product.soldCount || 0) + qty;
    } else {
      product.soldCount = Math.max(0, (product.soldCount || 0) - qty);
    }

    const sizeIndex = product.sizes.findIndex((s) => s.label === item.size);

    if (sizeIndex !== -1) {
      if (action === "decrease") {
        product.sizes[sizeIndex].stock = Math.max(
          0,
          product.sizes[sizeIndex].stock - qty,
        );
      } else {
        product.sizes[sizeIndex].stock += qty;
      }
      product.markModified("sizes");
    } else {
      console.warn(
        `⚠️ Size "${item.size}" not found in product ${product._id}. Stock not adjusted for this item.`,
      );
    }

    await product.save();
  }
};

const cancelShiprocketOrder = async (shiprocketOrderId) => {
  try {
    const token = await getShiprocketToken();
    if (token && shiprocketOrderId) {
      await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/cancel",
        { ids: [shiprocketOrderId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    }
  } catch (error) {
    console.error("⚠️ Shiprocket Cancel Error:", error.message);
  }
};

const verifyOrderOwnership = (order, userId) => {
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Not authorized to access this order");
  }
};

const restoreCouponUsage = async (order) => {
  if (order.appliedCoupon) {
    await Coupon.findByIdAndUpdate(order.appliedCoupon, {
      $pull: { usedBy: order.user },
    });
  }
};

const handleCancellation = async (order) => {
  await updateProductStock(order.orderItems, "restore");
  await cancelShiprocketOrder(order.shiprocketOrderId);
  await restoreCouponUsage(order);
};

const addOrderItems = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, isPaid, paidAt, paymentResult } =
    req.body;

  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    throw new ApiError(400, "Complete shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({ path: "items.product", select: PRODUCT_SELECT })
    .populate("appliedCoupon");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty — add items before ordering");
  }

  const validItems = cart.items.filter((item) => item.product != null);
  if (validItems.length === 0) {
    throw new ApiError(
      400,
      "All products in your cart are no longer available",
    );
  }

  for (const item of validItems) {
    const product = item.product;

    if (!product.inStock || product.countInStock < item.quantity) {
      throw new ApiError(
        400,
        `"${product.productName}" ${!product.inStock ? "is out of stock" : `only has ${product.countInStock} units available`}`,
      );
    }

    const sizeObj = product.sizes?.find((s) => s.label === item.size);
    if (sizeObj && sizeObj.stock < item.quantity) {
      throw new ApiError(
        400,
        `"${product.productName}" in size ${item.size} only has ${sizeObj.stock} units available`,
      );
    }
  }

  const coupon = cart.appliedCoupon;
  const billDetails = calculateBill(validItems, coupon);

  if (coupon?._id) {
    const freshCoupon = await Coupon.findById(coupon._id);

    if (!freshCoupon || !freshCoupon.isActive) {
      cart.appliedCoupon = null;
      await cart.save();
      throw new ApiError(
        400,
        "Applied coupon is no longer available. Please review your cart and try again.",
      );
    }

    const recheck = freshCoupon.isValid(
      req.user._id,
      billDetails.cartTotalExclTax,
    );

    if (!recheck.valid) {
      cart.appliedCoupon = null;
      await cart.save();
      throw new ApiError(
        400,
        `Coupon "${freshCoupon.code}": ${recheck.message}. Please place order again.`,
      );
    }
  }

  const orderItems = validItems.map((item) => {
    const pricing = calculatePricing(item.product);
    return {
      productName: item.product.productName,
      quantity: item.quantity,
      image: item.product.images?.[0]?.public_id || "",
      price: pricing.discountPrice || item.product.price,
      product: item.product._id,
      size: item.size || "M",
      color: item.color || "Standard",
    };
  });

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod: paymentMethod || "COD",
    itemsPrice: billDetails.cartTotalExclTax,
    taxPrice: billDetails.gstAmount,
    shippingPrice: billDetails.shipping,
    discountPrice: billDetails.discountAmount,
    totalPrice: billDetails.finalTotal,
    appliedCoupon: coupon?._id || null,
    isPaid: isPaid || false,
    paidAt: paidAt || null,
    paymentResult: paymentResult || {},
  });

  const createdOrder = await order.save();

  try {
    const user = await User.findById(req.user._id);
    if (user && (!user.addresses || user.addresses.length === 0)) {
      user.addresses.push({
        ...shippingAddress,
        addressType: "Home",
        isDefault: true,
      });
      await user.save();
    }
  } catch (error) {
    console.error("⚠️ Address Auto-Save Failed:", error.message);
  }

  await updateProductStock(orderItems, "decrease");

  if (coupon?._id) {
    await Coupon.findByIdAndUpdate(coupon._id, {
      $addToSet: { usedBy: req.user._id },
    });
  }

  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({ success: true, data: createdOrder });

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
          await Order.findByIdAndUpdate(createdOrder._id, {
            shiprocketOrderId: shiprocketRes.order_id,
            shiprocketShipmentId: shiprocketRes.shipment_id,
          });
        }
      }
    } catch (error) {
      console.error("⚠️ Shiprocket Sync Failed:", error.message);
    }
  })();

  (async () => {
    try {
      await sendOrderEmail(req.user.email, {
        orderId: createdOrder._id.toString(),
        totalAmount: createdOrder.totalPrice,
        address: `${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.pincode}`,
        items: orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          size: item.size || "N/A",
        })),
      });
    } catch (error) {
      console.error("⚠️ Email Error:", error.message);
    }
  })();
});

const requestReturn = asyncHandler(async (req, res) => {
  const { reason, comments, type } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, "Order not found");

  verifyOrderOwnership(order, req.user._id);

  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "Order must be delivered to initiate return");
  }

  const deliveryDate = new Date(order.deliveredAt);
  const diffDays = Math.ceil(
    Math.abs(new Date() - deliveryDate) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 7)
    throw new ApiError(400, "Return window closed (7 days exceeded)");
  if (order.returnInfo?.isReturnRequested)
    throw new ApiError(400, "Return request already submitted");

  order.returnInfo = {
    isReturnRequested: true,
    reason: reason || "",
    comments: comments || "",
    type: type
      ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      : "Refund",
    requestedAt: new Date(),
    status: "Pending",
  };

  order.orderStatus = "Return Requested";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Return request submitted",
    data: order,
  });
});

const handleReturnStatus = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, "Order not found");
  if (!["Approved", "Rejected", "Refunded"].includes(status))
    throw new ApiError(400, "Invalid return status");

  order.returnInfo.status = status;
  if (adminComment) order.returnInfo.adminComment = adminComment;

  if (status === "Approved") {
    order.orderStatus = "Return Approved";

    if (order.shiprocketOrderId) {
      try {
        const token = await getShiprocketToken();
        const totalQty = order.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        const returnPayload = {
          order_id: order.shiprocketOrderId,
          order_date: order.createdAt.toISOString().split("T")[0],
          pickup_customer_name: order.shippingAddress.fullName,
          pickup_address: order.shippingAddress.address,
          pickup_address_2: order.shippingAddress.landmark || "",
          pickup_city: order.shippingAddress.city,
          pickup_state: order.shippingAddress.state || "",
          pickup_country: "India",
          pickup_pincode: order.shippingAddress.pincode,
          pickup_email: "admin@krumeku.com",
          pickup_phone: order.shippingAddress.phone,
          order_items: order.orderItems.map((item) => ({
            name: item.productName,
            sku: item.product.toString(),
            units: item.quantity,
            selling_price: item.price,
          })),
          payment_method: "Prepaid",
          sub_total: order.totalPrice,
          length: 10,
          breadth: 10,
          height: 10,
          weight: totalQty * 0.5,
        };

        const response = await axios.post(
          "https://apiv2.shiprocket.in/v1/external/orders/create/return",
          returnPayload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        order.returnInfo.shiprocketReturnId = response.data.return_order_id;
      } catch (error) {
        console.error("❌ Shiprocket Return Failed:", error.message);
      }
    }
  } else if (status === "Refunded") {
    order.orderStatus = "Returned";
    order.isPaid = false;
    await updateProductStock(order.orderItems, "restore");
    await restoreCouponUsage(order);
  } else if (status === "Rejected") {
    order.orderStatus = "Delivered";
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Return ${status.toLowerCase()}`,
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, "Order not found");

  const newStatus = req.body.status || req.body.orderStatus;
  if (!newStatus) throw new ApiError(400, "Status is required");

  const allowedNext = VALID_TRANSITIONS[order.orderStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot change status from "${order.orderStatus}" to "${newStatus}". Allowed: ${
        allowedNext.length > 0 ? allowedNext.join(", ") : "none"
      }`,
    );
  }

  order.orderStatus = newStatus;

  if (newStatus === "Delivered") {
    order.deliveredAt = new Date();
    order.isDelivered = true;
    order.isPaid = true;
  }

  if (newStatus === "Cancelled") {
    await handleCancellation(order);
  }

  await order.save();
  res.status(200).json({ success: true, data: order });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "fullName email phone")
    .lean();

  if (!order) throw new ApiError(404, "Order not found");

  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  res.status(200).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, data: orders });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, "Order not found");
  verifyOrderOwnership(order, req.user._id);

  if (!USER_CANCELLABLE.includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot cancel — order is "${order.orderStatus}". Contact support for cancellation.`,
    );
  }

  await handleCancellation(order);
  order.orderStatus = "Cancelled";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.returnRequested === "true") {
    filter["returnInfo.isReturnRequested"] = true;
  }

  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate("user", "fullName email")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  await order.deleteOne();
  res.status(200).json({ success: true, message: "Order removed" });
});

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  requestReturn,
  handleReturnStatus,
};
