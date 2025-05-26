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

// ⚠️ Cấu hình CORS cho phép frontend (Next.js) truy cập
app.use(
  cors({
    origin: "http://localhost:3000/", // Thay bằng domain frontend thật nếu deploy
    credentials: true, // Bắt buộc nếu bạn dùng cookie, session, hoặc token
  })
);

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
