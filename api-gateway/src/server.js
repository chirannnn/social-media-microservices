require("dotenv").config();

const logger = require("./utils/logger");
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(`Identity service URL: ${process.env.IDENTITY_SERVICE_URL}`);
  logger.info(`Post service URL: ${process.env.POST_SERVICE_URL}`);
});
