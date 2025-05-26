// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const verifyToken = require("../../middleware/authMiddleware");

const router = express.Router();

// Đăng ký admin
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();
  res.json({ message: "Admin registered" });
});

// ✅ Đổi mật khẩu
router.patch("/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ error: "Mật khẩu hiện tại không đúng." });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công." });
});

// ✅ Cập nhật thông tin người dùng
router.patch("/update-profile", verifyToken, async (req, res) => {
  const { username, email, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (!user)
    return res.status(404).json({ error: "Không tìm thấy người dùng." });

  user.username = username || user.username;
  user.email = email || user.email;
  user.avatar = avatar || user.avatar;

  await user.save();

  res.json({
    message: "Cập nhật thông tin thành công.",
    userInfo: {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

// Đăng nhập admin
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu!" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({
    token: token,
    userInfo: { username: user?.username, email: user?.email },
  });
});

// ✅ Trả lại thông tin người dùng từ token
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password"); // không gửi mật khẩu
  if (!user) {
    return res.status(404).json({ error: "Người dùng không tồn tại." });
  }

  res.json({
    userInfo: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

module.exports = router;
