const express = require("express");
require("dotenv").config();
const connectDB = require("./Config/db_Config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./Middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5050;

app.set("trust proxy", 1);

// 🌍 CORS — Sabse Pehle
const allowedOrigins = [
  "http://localhost:5173",
  "https://krume-ku.vercel.app",
  "https://krumeku.com",
  "https://www.krumeku.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// 🛡️ SECURITY & PERFORMANCE — CORS ke baad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.disable("x-powered-by");

// 🚦 RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 200 : 2000,
  skip: () => process.env.NODE_ENV !== "production",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api/", limiter);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// 📦 BODY PARSERS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());

// 🤖 SEO & HEALTH
app.get("/robots.txt", (req, res) => {
  res
    .type("text/plain")
    .send("User-agent: *\nAllow: /\nSitemap: https://krumeku.com/sitemap.xml");
});

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Krumeku API is Live 🚀" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    timestamp: new Date().toISOString(),
  });
});

// 🛣️ ROUTES
const routes = {
  auth: require("./Routes/authRoutes"),
  admin: require("./Routes/adminRoutes"),
  products: require("./Routes/productsRoutes"),
  wishlist: require("./Routes/wishlistRoutes"),
  coupons: require("./Routes/couponRoutes"),
  cart: require("./Routes/cartRoutes"),
  orders: require("./Routes/orderRoutes"),
  shipping: require("./Routes/shippingRoutes"),
  payment: require("./Routes/paymentRoutes"),
  banners: require("./Routes/bannerRoutes"),
};

Object.entries(routes).forEach(([path, route]) =>
  app.use(`/api/${path}`, route),
);

// 🛑 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// 🛑 ERROR HANDLING
app.use(errorHandler);

// 🚀 START SERVER
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `\x1b[35m%s\x1b[0m`,
        `🚀 Krumeku Server initiated on Port: ${PORT}`,
      );
    });
  } catch (error) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `❌ Server failed to start: ${error.message}`,
    );
    process.exit(1);
  }
};

startServer();
