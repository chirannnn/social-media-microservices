const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      logger.warn("Access attempt without token");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    logger.warn("Invalid or expired token");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { validateToken };
