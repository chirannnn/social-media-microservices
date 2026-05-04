const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const identityProxy = proxy(process.env.IDENTITY_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },

  proxyReqOptDecorator: (proxyReqOpts) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },

  userResDecorator: (proxyRes, proxyResData) => {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`,
    );

    return proxyResData;
  },

  proxyErrorHandler: (err, res) => {
    logger.error("Proxy error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
});

module.exports = identityProxy;
