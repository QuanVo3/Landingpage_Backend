const express = require("express");
const Article = require("../../models/Article");
const verifyToken = require("../../middleware/authMiddleware");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://devopslab.io.vn/api/articles/");
    res.json({ articles: response.data });
  } catch (err) {
    res.status(400).json({
      error: "Lấy bài viết thất bại!",
      err: err.response?.data || err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://devopslab.io.vn/api/articles/category/${req.params.id}/`
    );
    res.json({ articles: response.data });
  } catch (err) {
    res.status(400).json({
      error: "Lấy bài viết thất bại!",
      err: err.response?.data || err.message,
    });
  }
});

// POST: Tạo mới bài viết
router.post("/", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug, createdAt } =
    req.body;
  if (!title || !content || !category || !author || !thumbnail || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }
  try {
    await axios.post("https://devopslab.io.vn/api/articles/", {
      title: title,
      content: content,
      category: category,
      author: author,
      thumbnail: thumbnail,
      slug: slug,
      createdAt: createdAt,
    });
    res.status(201).json({ message: "Tạo bài viết thành công" });
  } catch (err) {
    res.status(400).json({
      error: "Tên bài viết đã tồn tại hoặc không hợp lệ.",
      err: err.response?.data || err.message,
    });
  }
});

// PUT: Cập nhật bài viết
router.put("/:id", verifyToken, async (req, res) => {
  const { title, content, category, author, thumbnail, slug } = req.body;
  if (!title || !content || !category || !author || !thumbnail || !slug) {
    return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
  }
  try {
    await axios.put(`https://devopslab.io.vn/api/articles/${req.params.id}/`, {
      title: title,
      content: content,
      category: category,
      author: author,
      thumbnail: thumbnail,
      slug: slug,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ message: "Cập nhật viết thành công" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Tên bài viết đã tồn tại hoặc không hợp lệ.", err });
  }
});

// DELETE: Xóa nhiều bài viết
router.delete("/", verifyToken, async (req, res) => {
  const { ids } = req.body;

  try {
    await axios.delete(`https://devopslab.io.vn/api/articles/bulk-delete/`, {
      ids: ids,
    });
    res.status(201).json({ message: "Xóa bài viết thành công" });
  } catch (err) {
    res.status(400).json({ error: "Xóa bài viết thất bại", err });
  }
});

module.exports = router;
