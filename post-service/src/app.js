const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const postRoutes = require("./routes/post.routes");
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/logger.middleware");
const redisClient = require("./config/redis");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes,
);

app.use(errorHandler);

module.exports = app;
