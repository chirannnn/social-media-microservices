require("dotenv").config();

const app = require("./app");

const connectToDB = require("./database/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(PORT, () => {
      logger.info(`Media service running on PORT ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);
});
