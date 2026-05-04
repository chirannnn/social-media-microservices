const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const rateLimiter = require("./config/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");
const identityProxy = require("./config/proxy");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(rateLimiter);
app.use(requestLogger);

app.use("/v1/auth", identityProxy);

app.use(errorHandler);

module.exports = app;
