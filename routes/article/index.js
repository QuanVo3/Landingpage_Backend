const express = require("express");
const Article = require("../../models/Article");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

// Lấy tất cả bài viết
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy tất cả bài viết." });
  }
});

// Lấy tất cả bài viết theo danh mục
router.get("/category/:categoryId", async (req, res) => {
  try {
    const articles = await Article.find({ category: req.params.categoryId });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy bài viết." });
  }
});

// Tạo mới bài viết
router.post("/", verifyToken, async (req, res) => {
  const { title, content, category, author } = req.body;

  if (!title || !content || !category || !author) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const newArticle = new Article({ title, content, category, author });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tạo bài viết." });
  }
});

// Sửa bài viết
router.put("/:id", verifyToken, async (req, res) => {
  const { title, content, category, author } = req.body;

  if (!title || !content || !category || !author) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, category, author },
      { new: true }
    );
    res.json(updatedArticle);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi sửa bài viết." });
  }
});

// Xóa bài viết
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa bài viết thành công." });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa bài viết." });
  }
});

module.exports = router;
