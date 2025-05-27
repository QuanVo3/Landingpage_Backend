const express = require("express");
const Category = require("../../models/Category");
const verifyToken = require("../../middleware/authMiddleware");
const Article = require("../../models/Article");

const router = express.Router();

// GET tất cả danh mục
router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
});

// POST tạo mới danh mục
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const newCategory = new Category({ name, slug });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ.", err });
  }
});

// PUT cập nhật danh mục
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Không thể cập nhật danh mục." });
  }
});

// DELETE xóa danh mục
router.delete("/", verifyToken, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Danh sách ID không hợp lệ." });
  }

  try {
    await Article.deleteMany({ category: { $in: ids } });
    await Category.deleteMany({ _id: { $in: ids } });

    res.json({
      message: `Xóa thành công`,
    });
  } catch (err) {
    console.error("Lỗi xóa hàng loạt:", err);
    res.status(500).json({ error: "Không thể xóa danh mục." });
  }
});

module.exports = router;
