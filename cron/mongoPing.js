const mongoose = require("mongoose");

function pingMongoDB() {
  if (mongoose.connection.readyState === 1) {
    const admin = mongoose.connection.db.admin();
    admin.ping((err, result) => {
      if (err) {
        console.error("❌ Ping MongoDB thất bại:", err);
      } else {
        console.log("✅ Ping MongoDB thành công:", result);
      }
    });
  } else {
    console.warn("⚠️ MongoDB chưa sẵn sàng để ping");
  }
}

module.exports = pingMongoDB;
