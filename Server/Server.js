const express = require("express");
require("dotenv").config();
const connectDB = require("./Config/db_Config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler } = require("./Middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5050;

// Database Connection
connectDB();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://krume-ku.vercel.app", 
  process.env.FRONTEND_URL,      
].filter(Boolean); 

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.some(ao => origin.startsWith(ao))) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS Policy: This origin is not allowed!"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get("/", (req, res) => {
  res.send("Welcome to Krumeku Server!");
});

// Routes
app.use("/api/auth", require("./Routes/authRoutes"));
app.use("/api/admin/", require("./Routes/adminRoutes"));
app.use("/api/products", require("./Routes/productsRoutes"));
app.use("/api/wishlist", require("./Routes/wishlistRoutes"));
app.use("/api/coupons", require("./Routes/couponRoutes"));
app.use("/api/cart", require("./Routes/cartRoutes"));
app.use("/api/orders", require("./Routes/orderRoutes"));
app.use("/api/shipping", require("./Routes/shippingRoutes"));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});