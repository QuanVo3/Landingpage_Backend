const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes (đã dùng Prisma trong route rồi)
const authRoutes = require("./routes/Auth/index");
const categoryRoutes = require("./routes/Category/index");
const articleRoutes = require("./routes/Article/index");
const miniAppOptionsRoutes = require("./routes/MiniAppOptions/index");

// Tạo app
const app = express();

// Cấu hình middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// Khai báo routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/mini-app-options", miniAppOptionsRoutes);

// Khởi động server (Prisma không cần connect thủ công ở đây)
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
