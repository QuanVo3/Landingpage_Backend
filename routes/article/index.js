const express = require("express");
const Article = require("../../models/Article");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

// Lấy tất cả bài viết
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().populate({
      path: "category",
      select: "name", // chỉ lấy trường name của danh mục
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy tất cả bài viết." });
  }
});

// Lấy tất cả bài viết theo danh mục
router.get("/category/:categoryId", async (req, res) => {
  try {
    const articles = await Article.find({
      category: req.params.categoryId,
    }).populate({
      path: "category",
      select: "name", // chỉ lấy trường name của danh mục
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy bài viết." });
  }
});

// Tạo mới bài viết
router.post("/", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug } = req.body;

  if (!title || !content || !category || !author || !thumbnail || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const newArticle = new Article({
      title,
      content,
      category,
      author,
      thumbnail,
      slug,
    });
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Lỗi khi tạo bài viết:", err);
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
router.delete("/", verifyToken, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Vui lòng cung cấp mảng ID hợp lệ." });
  }

  try {
    await Article.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Xóa thành công` });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa bài viết." });
  }
});

module.exports = router;
