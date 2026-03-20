const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        msg: "No authorization header provided"
      });
    }

    // Expected format: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({
        success: false,
        msg: "Invalid authorization format"
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Handle both id and _id safely
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        msg: "Invalid token payload"
      });
    }

    next();

  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);

    return res.status(401).json({
      success: false,
      msg: "Token invalid or expired"
    });
  }
};