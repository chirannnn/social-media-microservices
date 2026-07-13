const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const searchRoutes = require("./routes/search.routes");
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/logger.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.use(
  "/api/search",
  searchRoutes
);

app.use(errorHandler);

module.exports = app;
