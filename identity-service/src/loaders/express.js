const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const requestLogger = require("../middlewares/requestLogger");
const globalRateLimiter = require("../middlewares/rateLimiter");
const routes = require("../routes/identity.routes");
const errorHandler = require("../middlewares/errorHandler");
const sensitiveLimiter = require("../config/sensitiveLimiter");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use(globalRateLimiter);

app.use("/api/auth/register", sensitiveLimiter);
app.use("/api/auth", routes);

app.use(errorHandler);

module.exports = app;
