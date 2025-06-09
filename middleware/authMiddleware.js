const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const verifyToken = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy user từ database theo decoded id
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true, avatar: true }, // lấy những trường cần thiết
      });

      if (!user) {
        return res.status(401).json({ error: "Người dùng không tồn tại." });
      }

      req.user = user; // đính kèm user info vào request
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ error: "Token đã hết hạn." });
      }
      return res.status(403).json({ error: "Token không hợp lệ." });
    }
  } else {
    return res
      .status(401)
      .json({ error: "Bạn chưa đăng nhập hoặc thiếu token." });
  }
};

module.exports = verifyToken;
