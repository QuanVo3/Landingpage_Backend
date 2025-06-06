const express = require("express");
const Article = require("../../models/Article");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

// GET: Lấy tất cả bài viết (có phân trang)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const articles = await Article.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({ path: "category", select: "name" });

    const total = await Article.countDocuments();

    res.json({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách bài viết." });
  }
});

// GET: Bài viết theo danh mục
// GET: Bài viết theo danh mục (có phân trang)
router.get("/category/:categoryId", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [articles, total] = await Promise.all([
      Article.find({ category: req.params.categoryId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({ path: "category", select: "name" }),
      Article.countDocuments({ category: req.params.categoryId }),
    ]);

    res.json({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy bài viết theo danh mục." });
  }
});

// GET: Bài viết theo slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate(
      "category",
      "name"
    );
    if (!article)
      return res.status(404).json({ error: "Không tìm thấy bài viết." });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy bài viết theo slug." });
  }
});

// POST: Tạo mới bài viết
router.post("/", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug } = req.body;

  if (!title || !content || !category || !author || !thumbnail || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "Slug đã tồn tại." });
    }

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

// PUT: Cập nhật bài viết
router.put("/:id", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug } = req.body;

  if (!title || !content || !category || !author || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { title, content, category, author, thumbnail, slug },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy bài viết để cập nhật." });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật bài viết." });
  }
});

// DELETE: Xóa nhiều bài viết
router.delete("/", verifyToken, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Vui lòng cung cấp mảng ID hợp lệ." });
  }

  try {
    const result = await Article.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Đã xóa ${result.deletedCount} bài viết.` });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa bài viết." });
  }
});

module.exports = router;
