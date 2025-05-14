const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // lưu info user vào req
      next();
    } catch (err) {
      return res
        .status(403)
        .json({ error: "Token không hợp lệ hoặc đã hết hạn." });
    }
  } else {
    return res
      .status(401)
      .json({ error: "Bạn chưa đăng nhập hoặc thiếu token." });
  }
};

module.exports = verifyToken;
