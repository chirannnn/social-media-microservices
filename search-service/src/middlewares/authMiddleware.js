const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      logger.warn("Access attempted without user ID");
      return res.status(401).json({
        success: false,
        message: "Authentication required! Please login to continue",
      });
    }

    req.user = { userId };
    next();
  } catch (error) {
    logger.error("Authentication middleware error", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { authenticateRequest };
