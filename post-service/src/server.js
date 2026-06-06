require("dotenv").config();

const app = require("./app");
const connectToDB = require("./database/db");
const { connectToRabbitMQ } = require("./utils/rabbitmq");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await connectToDB();

    await connectToRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);
});
