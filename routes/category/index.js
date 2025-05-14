const express = require("express");
const Category = require("../../models/Category");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

// GET tất cả danh mục
router.get("/", async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
});

// POST tạo mới danh mục
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ." });
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
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa danh mục" });
  } catch (err) {
    res.status(400).json({ error: "Không thể xóa danh mục." });
  }
});

module.exports = router;
