require("dotenv").config();

const app = require("./app");
const connectToDB = require("./database/db");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const {handlePostCreated, handlePostDeleted} = require('./eventHandlers/search.event.handler')
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    await connectToDB();

    await connectToRabbitMQ();

    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search service is running on port: ${PORT}`);
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
