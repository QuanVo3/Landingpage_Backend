const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Chỉ đính kèm decoded token (thường chứa user id, email...) vào req để dùng sau
      req.user = decoded;
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
