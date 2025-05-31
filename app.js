const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const pingMongoDB = require("./cron/mongoPing");

// Import routes
const authRoutes = require("./routes/Auth/index");
const categoryRoutes = require("./routes/Category/index");
const articleRoutes = require("./routes/Article/index");
const miniAppOptionsRoutes = require("./routes/MiniAppOptions/index");

// Tạo app
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/mini-app-options", miniAppOptionsRoutes);

// Kết nối MongoDB và khởi động server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
  })
  .then(() => {
    // ✅ Cron job mỗi 5 phút
    cron.schedule("*/5 * * * *", pingMongoDB);

    // Khởi động server
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
