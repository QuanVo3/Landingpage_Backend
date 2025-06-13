const express = require("express");
const Category = require("../../models/Category");
const verifyToken = require("../../middleware/authMiddleware");
const Article = require("../../models/Article");
const axios = require("axios");

const router = express.Router();

// GET tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://devopslab.io.vn/api/categories");

    // Chuyển đổi id thành _id
    const modifiedData = response.data.map((item) => ({
      ...item,
      _id: item.id,
      id: item.id, // Xóa trường cũ nếu cần
    }));

    res.json(modifiedData);
  } catch (err) {
    res.status(400).json({
      error: "Lấy danh mục bài viết thất bại!",
      err: err.response?.data || err.message,
    });
  }
});

// POST tạo mới danh mục
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;
    await axios.post("https://devopslab.io.vn/api/categories/", {
      name: name,
      slug: slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.status(201).json({ message: "Tạo danh mục thành công" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ.", err });
  }
});

// PUT cập nhật danh mục
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;
    await axios.put(
      `https://devopslab.io.vn/api/categories/${req.params.id}/`,
      {
        name: name,
        slug: slug,
        updatedAt: new Date().toISOString(),
      }
    );
    res.status(201).json({ message: "Sửa danh mục thành công" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ.", err });
  }
});

// DELETE xóa danh mục
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await axios.delete(
      `https://devopslab.io.vn/api/categories/${req.params.id}/`
    );
    res.status(201).json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    res.status(400).json({ error: "Xóa danh mục thất bại", err });
  }
});

module.exports = router;
