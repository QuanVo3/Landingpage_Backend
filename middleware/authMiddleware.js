const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  if (req.method === "OPTIONS") {
    // Cho phép preflight request đi qua mà không kiểm tra token
    return next();
  }

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // lưu info user vào req
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
