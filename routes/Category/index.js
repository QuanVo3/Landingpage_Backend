const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// GET tất cả danh mục
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(categories);
  } catch (err) {
    console.error("Lỗi lấy danh mục:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh mục." });
  }
});

// POST tạo mới danh mục
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Kiểm tra tên danh mục đã tồn tại chưa
    const exists = await prisma.category.findUnique({
      where: { slug }, // hoặc where: { name } tùy bạn dùng trường nào để unique
    });

    if (exists) {
      return res.status(400).json({ error: "Danh mục đã tồn tại." });
    }

    const newCategory = await prisma.category.create({
      data: { name, slug },
    });

    res.status(201).json(newCategory);
  } catch (err) {
    console.error("Lỗi tạo danh mục:", err);
    res
      .status(400)
      .json({ error: "Tên danh mục đã tồn tại hoặc không hợp lệ." });
  }
});

// PUT cập nhật danh mục
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, slug } = req.body;
    const id = req.params.id;

    // Tùy chỉnh check nếu muốn

    const updatedCategory = await prisma.category.update({
      where: { id: id }, // hoặc id nếu là string UUID: { id }
      data: { name, slug },
    });

    res.json(updatedCategory);
  } catch (err) {
    console.error("Lỗi cập nhật danh mục:", err);
    res.status(400).json({ error: "Không thể cập nhật danh mục." });
  }
});

// DELETE xóa danh mục (hàng loạt)
router.delete("/", verifyToken, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Danh sách ID không hợp lệ." });
    }

    // Chuyển id sang đúng kiểu (nếu cần)
    const parsedIds = ids.map((id) => id); // hoặc nếu id string thì bỏ map này

    // Xóa các bài viết thuộc các category này
    await prisma.article.deleteMany({
      where: {
        categoryId: { in: parsedIds },
      },
    });

    // Xóa danh mục
    await prisma.category.deleteMany({
      where: {
        id: { in: parsedIds },
      },
    });

    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("Lỗi xóa hàng loạt:", err);
    res.status(500).json({ error: "Không thể xóa danh mục." });
  }
});

module.exports = router;
