const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const articleRoutes = require("./routes/article");

// Tạo app
const app = express();

const allowedOrigins = [
  "http://localhost:3000", // Cho phép frontend dev
  "https://meteoviet.org", // Cho phép gọi trực tiếp từ production
  "https://meteoviet.vn", // Cho phép gọi trực tiếp từ frontend production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
  })
);

// Cho phép preflight request (OPTIONS)
app.options("*", cors());

// Tăng giới hạn body size
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Sử dụng routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);

// Kết nối MongoDB và khởi động server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
