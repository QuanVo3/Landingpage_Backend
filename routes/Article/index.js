const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET: Lấy tất cả bài viết (phân trang bằng limit & offset)
router.get("/", async (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 100)); // max 100
  const offset = parseInt(req.query.offset) || 0;

  try {
    const articles = await prisma.article.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    });

    const total = await prisma.article.count();

    res.json({
      articles,
      total,
      offset,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách bài viết." });
  }
});

// GET: Bài viết theo danh mục (phân trang)
router.get("/category/:categoryId", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const categoryId = req.params.categoryId; // id kiểu string, không cần convert số

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { categoryId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
      prisma.article.count({ where: { categoryId } }),
    ]);

    res.json({
      articles,
      total,
      offset,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy bài viết theo danh mục." });
  }
});

// GET: Bài viết theo slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: { category: { select: { name: true } } },
    });

    if (!article)
      return res.status(404).json({ error: "Không tìm thấy bài viết." });

    res.json(article);
  } catch (err) {
    console.error(err);
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
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: "Slug đã tồn tại." });
    }

    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        categoryId: category, // categoryId là string, không convert số
        author,
        thumbnail,
        slug,
      },
      include: { category: true },
    });

    res.status(201).json(newArticle);
  } catch (err) {
    console.error("Lỗi khi tạo bài viết:", err);
    res.status(500).json({ error: "Lỗi khi tạo bài viết." });
  }
});

// PUT: Cập nhật bài viết
router.put("/:id", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug } = req.body;
  const id = req.params.id; // id là string, không convert

  if (!title || !content || !category || !author || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }

  try {
    const updated = await prisma.article.update({
      where: { _id: id },
      data: {
        title,
        content,
        categoryId: category,
        author,
        thumbnail,
        slug,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Không tìm thấy bài viết để cập nhật." });
    }
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
    // ids là mảng string, không convert sang number
    const stringIds = ids.map((id) => id.toString());

    const result = await prisma.article.deleteMany({
      where: { _id: { in: stringIds } },
    });

    res.json({ message: `Đã xóa ${result.count} bài viết.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa bài viết." });
  }
});

module.exports = router;
