const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const mediaRoutes = require("./routes/media.routes");
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/logger.middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

module.exports = app;
