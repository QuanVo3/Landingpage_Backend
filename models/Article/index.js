const mongoose = require("mongoose");

// Schema cho bài viết
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Liên kết với danh mục
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Tạo model Article
module.exports = mongoose.model("Article", articleSchema);
