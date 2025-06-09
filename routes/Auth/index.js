const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../../middleware/authMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// Đăng ký admin
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Kiểm tra username hoặc email đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Tên đăng nhập hoặc email đã được sử dụng." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
    });

    res.json({ message: "Admin registered" });
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    res.status(500).json({ error: "Lỗi server khi đăng ký." });
  }
});

// Đổi mật khẩu
router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin mật khẩu." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: "Mật khẩu hiện tại không đúng." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    console.error("Lỗi khi đổi mật khẩu:", err);
    res.status(500).json({ error: "Lỗi server khi đổi mật khẩu." });
  }
});

// Cập nhật thông tin người dùng
router.patch("/update-profile", verifyToken, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }

    // Kiểm tra trùng username
    if (username && username !== user.username) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (exists) {
        return res
          .status(409)
          .json({ error: "Tên đăng nhập đã được sử dụng." });
      }
    }

    // Kiểm tra trùng email
    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return res.status(409).json({ error: "Email đã được sử dụng." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username: username || user.username,
        email: email || user.email,
        avatar: avatar || user.avatar,
      },
    });

    res.json({
      message: "Cập nhật thông tin thành công.",
      userInfo: {
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật thông tin:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật thông tin." });
  }
});

// Đăng nhập admin
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Thiếu tên đăng nhập hoặc mật khẩu." });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ error: "Sai tên đăng nhập hoặc mật khẩu!" });
    }

    // token có thời hạn 1 ngày
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      userInfo: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi server khi đăng nhập." });
  }
});

// Trả lại thông tin người dùng từ token
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    res.json({ userInfo: user });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin user:", err);
    res.status(500).json({ error: "Lỗi server khi lấy thông tin người dùng." });
  }
});

module.exports = router;
