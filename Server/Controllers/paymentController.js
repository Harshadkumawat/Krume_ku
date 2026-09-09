const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const Cart = require("../Models/CartSchema");
const Order = require("../Models/orderModel");
const User = require("../Models/userSchema");
const Coupon = require("../Models/couponModel");
const Product = require("../Models/ProductSchema");
const { calculateBill } = require("../Utils/cartCalculator");
const { ApiError } = require("../Middleware/errorMiddleware");
const { getShiprocketToken } = require("./shippingController");
const syncOrderToShiprocket = require("../Utils/shiprocketOrder");
const sendOrderEmail = require("../Utils/sendEmail");
const { getGstRate } = require("../Utils/calculatePricing");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    `\x1b[31m%s\x1b[0m`,
    "❌ CRITICAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env",
  );
}

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}

const PRODUCT_SELECT =
  "productName price discountPercent discountPrice discountAmount gstRate gstAmount finalPriceWithTax images category subCategory colors sizes countInStock inStock";

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

const reduceStockForOrder = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      console.warn(`⚠️ Product not found: ${item.product} — stock not reduced`);
      continue;
    }

    const qty = item.quantity;

    
    product.soldCount = (product.soldCount || 0) + qty;

   
    product.countInStock = Math.max(0, (product.countInStock || 0) - qty);

   
    const sizeIndex = product.sizes.findIndex((s) => s.label === item.size);
    if (sizeIndex !== -1) {
      product.sizes[sizeIndex].stock = Math.max(
        0,
        product.sizes[sizeIndex].stock - qty,
      );
      product.markModified("sizes");
    } else {
      console.warn(
        `⚠️ Size "${item.size}" not found in product ${product._id} — size stock not adjusted`,
      );
    }

    await product.save();
  }
};



const handlePostPayment = async ({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  source,
}) => {
  
  const orderBefore = await Order.findOneAndUpdate(
    { _id: orderId, isPaid: false },
    {
      $set: {
        isPaid: true,
        paidAt: new Date(),
        orderStatus: "Confirmed",
        paymentStatus: "Paid", 
        razorpayOrderId: razorpay_order_id,
        paymentResult: {
          id: razorpay_payment_id,
          status: "captured",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      },
    },
    { new: false },
  );

  if (!orderBefore) {
    console.log(
      `[${source}] Order ${orderId} already processed — skipping all`,
    );
    return;
  }

  console.log(`[${source}] Order ${orderId} marked paid`);

 
  const order = await Order.findById(orderId);
  const user = await User.findById(order.user).select("email fullName");
  if (!order || !user) return;

  
  const stockGuard = await Order.findOneAndUpdate(
    { _id: orderId, stockReduced: false },
    { $set: { stockReduced: true } },
    { new: false },
  );

  if (stockGuard) {
    try {
      await reduceStockForOrder(order.orderItems);
      console.log(`[${source}] Stock reduced for order ${orderId}`);
    } catch (err) {
      console.error(`[${source}] Stock reduce failed:`, err.message);
      
      await Order.findByIdAndUpdate(orderId, { stockReduced: false });
    }
  } else {
    console.log(
      `[${source}] Stock already reduced for order ${orderId} — skipping`,
    );
  }

  
  try {
    await Cart.findOneAndDelete({ user: order.user });

    if (order.appliedCoupon) {
      await Coupon.findByIdAndUpdate(order.appliedCoupon, {
        $addToSet: { usedBy: order.user },
      });
    }
  } catch (err) {
    console.error(`[${source}] Cart/Coupon cleanup failed:`, err.message);
  }

  
  if (!order.shiprocketOrderId) {
    try {
      const token = await getShiprocketToken();
      if (token) {
        const shiprocketRes = await syncOrderToShiprocket(
          order,
          token,
          user.email,
          user.fullName,
        );
        if (shiprocketRes) {
          await Order.findByIdAndUpdate(orderId, {
            shiprocketOrderId: shiprocketRes.order_id,
            shiprocketShipmentId: shiprocketRes.shipment_id,
          });
          console.log(`[${source}] Shiprocket synced for order ${orderId}`);
        }
      }
    } catch (err) {
      console.error(`[${source}] Shiprocket sync failed:`, err.message);
    }
  } else {
    console.log(
      `[${source}] Shiprocket already synced for order ${orderId} — skipping`,
    );
  }

 
  const emailGuard = await Order.findOneAndUpdate(
    { _id: orderId, confirmationEmailSent: false },
    { $set: { confirmationEmailSent: true } },
    { new: false },
  );

  if (emailGuard) {
    try {
      const discountRatio =
        order.itemsPrice > 0 ? order.discountPrice / order.itemsPrice : 0;

      await sendOrderEmail(user.email, {
        orderId: order._id.toString(),
        totalAmount: order.totalPrice,
        address: `${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`,
        items: order.orderItems.map((item) => {
          const priceExclGst = Number(item.price) || 0;
          const itemTaxable = priceExclGst * (1 - discountRatio);
          const gstRate = getGstRate(itemTaxable);
          const inclGstPrice = Math.round(itemTaxable * (1 + gstRate / 100));
          return {
            name: item.productName,
            quantity: item.quantity,
            price: inclGstPrice,
            image: item.image,
            size: item.size || "N/A",
          };
        }),
      });
      console.log(`[${source}] Confirmation email sent for order ${orderId}`);
    } catch (err) {
      console.error(`[${source}] Email failed:`, err.message);
      
      await Order.findByIdAndUpdate(orderId, {
        confirmationEmailSent: false,
      });
    }
  } else {
    console.log(
      `[${source}] Email already sent for order ${orderId} — skipping`,
    );
  }
};



exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    throw new ApiError(500, "Payment service not configured");
  }

  const cart = await Cart.findOne({ user: req.user._id })
    .populate({ path: "items.product", select: PRODUCT_SELECT })
    .populate("appliedCoupon");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty — add items before payment");
  }

  const validItems = cart.items.filter((item) => item.product != null);
  if (validItems.length === 0) {
    throw new ApiError(
      400,
      "All products in your cart are no longer available",
    );
  }

  const billDetails = calculateBill(validItems, cart.appliedCoupon);
  const serverAmount = billDetails.finalTotal;

  if (!serverAmount || serverAmount <= 0) {
    throw new ApiError(400, "Invalid order amount");
  }

  const options = {
    amount: Math.round(serverAmount * 100),
    currency: "INR",
    receipt: `rcpt_${Date.now()}`.slice(0, 40),
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({ success: true, order });
});

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Verify Razorpay Payment
// ─────────────────────────────────────────────────────────────────────────────

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment verification fields");
  }
  if (!orderId) {
    throw new ApiError(400, "Order ID is required for verification");
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payment verification not configured");
  }

  // ── Signature verify ──────────────────────────────────────────────────────
  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  const sigBuffer = Buffer.from(razorpay_signature);
  const expBuffer = Buffer.from(expectedSign);

  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }

  // ── Order exist + ownership check ────────────────────────────────────────
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  
  if (order.isPaid) {
    return res
      .status(200)
      .json({ success: true, message: "Payment already verified" });
  }


  res
    .status(200)
    .json({ success: true, message: "Payment verified successfully" });

  
  (async () => {
    try {
      await handlePostPayment({
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        source: "verify",
      });
    } catch (err) {
      console.error("⚠️ verifyRazorpayPayment background failed:", err.message);
    }
  })();
});



exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ RAZORPAY_WEBHOOK_SECRET missing in .env");
    return res.status(400).json({ success: false });
  }

  // ── Webhook signature verify ──────────────────────────────────────────────
  const receivedSig = req.headers["x-razorpay-signature"];
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (receivedSig !== expectedSig) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (event !== "payment.captured" || !paymentEntity) {
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  const razorpayOrderId = paymentEntity.order_id;
  const razorpayPaymentId = paymentEntity.id;

  if (!razorpayOrderId) {
    return res
      .status(200)
      .json({ success: true, message: "No order_id in payload" });
  }

  const order = await Order.findOne({ razorpayOrderId });

  if (!order) {
    console.warn(
      `⚠️ Webhook: Order not found for razorpayOrderId: ${razorpayOrderId}`,
    );
    return res.status(200).json({ success: true });
  }

 
  res.status(200).json({ success: true });

  (async () => {
    try {
      await handlePostPayment({
        orderId: order._id.toString(),
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        source: "webhook",
      });
    } catch (err) {
      console.error("⚠️ Webhook background failed:", err.message);
    }
  })();
});
