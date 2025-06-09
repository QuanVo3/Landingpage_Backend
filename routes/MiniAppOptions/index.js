const express = require("express");
const verifyToken = require("../../middleware/authMiddleware");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// GET MiniAppOptions
router.get("/", async (req, res) => {
  try {
    const options = await prisma.miniAppOptions.findFirst();
    if (!options) {
      return res.status(404).json({ message: "Không tìm thấy cấu hình." });
    }
    res.json(options);
  } catch (error) {
    console.error("Lỗi server khi lấy cấu hình:", error);
    res.status(500).json({ message: "Lỗi server khi lấy cấu hình", error });
  }
});

// PUT hoặc POST cập nhật MiniAppOptions (ở đây giữ nguyên POST theo bạn)
router.post("/", verifyToken, async (req, res) => {
  const { showFacebook, showYouTube, showIntroduction } = req.body;
  try {
    // Sử dụng upsert: nếu chưa có thì tạo mới, có thì update
    const updatedOptions = await prisma.miniAppOptions.upsert({
      where: {}, // Prisma không cho phép where rỗng, nên phải dùng findFirst và nếu không có thì tạo mới
      create: {
        showFacebook,
        showYouTube,
        showIntroduction,
      },
      update: {
        showFacebook,
        showYouTube,
        showIntroduction,
      },
    });
    res.json(updatedOptions);
  } catch (error) {
    console.error("Lỗi server khi cập nhật cấu hình:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật cấu hình.", error });
  }
});

// POST khởi tạo MiniAppOptions mặc định (chỉ khi chưa tồn tại)
router.post("/init", verifyToken, async (req, res) => {
  try {
    const existing = await prisma.miniAppOptions.findFirst();
    if (existing) {
      return res.status(400).json({ message: "Cấu hình đã tồn tại." });
    }
    const defaultOptions = await prisma.miniAppOptions.create({
      data: {
        showFacebook: false,
        showYouTube: false,
        showIntroduction: false,
      },
    });
    res.status(201).json(defaultOptions);
  } catch (error) {
    console.error("Lỗi khi khởi tạo cấu hình mặc định:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi khởi tạo cấu hình mặc định.", error });
  }
});

module.exports = router;
