const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/Auth/index");
const categoryRoutes = require("./routes/Category/index");
const articleRoutes = require("./routes/Article/index");
const miniAppOptionsRoutes = require("./routes/MiniAppOptions/index");

// Tạo app
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://zalo.me", // hoặc domain chính xác nơi Zalo mini app chạy
  "https://yourfrontenddomain.com", // domain frontend thực tế
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // cho request không có origin (ví dụ mobile app)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Sử dụng routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/mini-app-options", miniAppOptionsRoutes);

// Kết nối MongoDB và khởi động server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
