const express = require("express");
require("dotenv").config();
const connectDB = require("./Config/db_Config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler } = require("./Middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5050;

connectDB();
// Allowed Origins ki list
const allowedOrigins = [
  "http://localhost:5173",
  "https://krume-dunazr1yr-harshadkumawats-projects.vercel.app", 
  "https://krume-ku.vercel.app", 
];

app.use(
  cors({
    origin: function (origin, callback) {
      
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to Krumeku Server!");
});

app.use("/api/auth", require("./Routes/authRoutes"));
app.use("/api/admin/", require("./Routes/adminRoutes"));
app.use("/api/products", require("./Routes/productsRoutes"));
app.use("/api/wishlist", require("./Routes/wishlistRoutes"));
app.use("/api/coupons", require("./Routes/couponRoutes"));
app.use("/api/cart", require("./Routes/cartRoutes"));
app.use("/api/orders", require("./Routes/orderRoutes"));
app.use("/api/shipping", require("./Routes/shippingRoutes"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
