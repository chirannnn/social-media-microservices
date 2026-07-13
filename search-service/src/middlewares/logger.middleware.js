const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info("Request body", req.body);
  next();
};

module.exports = requestLogger;
