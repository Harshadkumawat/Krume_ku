const express = require("express");
require("dotenv").config();
const connectDB = require("./Config/db_Config");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

connectDB();

app.use(
  cors({
    origin: "https://krume-ku.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to Krumeku Server!");
});

app.use("/api/auth", require("./Routes/authRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
