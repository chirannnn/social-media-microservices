const logger = require("./logger");

const invalidateCacheByPattern = async (redisClient, pattern) => {
  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);

      logger.info(`Cache invalidated for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Cache invalidation failed: ${error.message}`);
  }
};

module.exports = { invalidateCacheByPattern };
