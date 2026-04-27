require("dotenv").config();

const logger = require("./utils/logger");
const connectToDB = require("./database/db");
const app = require("./loaders/express");

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(PORT, () => {
      logger.info(`Identity service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});
