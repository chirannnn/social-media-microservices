const { RateLimiterRedis } = require("rate-limiter-flexible");
const redisClient = require("../config/redis");
const logger = require("../utils/logger");

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

const globalRateLimiter = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
};

module.exports = globalRateLimiter;
