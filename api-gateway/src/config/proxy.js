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
    logger.error("Identity Proxy error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Identity service error",
    });
  },
});

const postProxy = proxy(process.env.POST_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },

  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },

  userResDecorator: (proxyRes, proxyResData) => {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);

    return proxyResData;
  },

  proxyErrorHandler: (err, res) => {
    logger.error("Post Proxy error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Post service error",
    });
  },
});

const mediaProxy = proxy(process.env.MEDIA_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },

  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
    return proxyReqOpts;
  },

  userResDecorator: (proxyRes, proxyResData) => {
    logger.info(`Response received from Media service: ${proxyRes.statusCode}`);

    return proxyResData;
  },

  parseReqBody: false,

  proxyErrorHandler: (err, res) => {
    logger.error("Media Proxy error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Media service error",
    });
  },
});

const searchProxy = proxy(process.env.SEARCH_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },

  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },

  userResDecorator: (proxyRes, proxyResData) => {
    logger.info(`Response received from Search service: ${proxyRes.statusCode}`);

    return proxyResData;
  },

  proxyErrorHandler: (err, res) => {
    logger.error("Search Proxy error", {
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: "Search service error",
    });
  },
});

module.exports = { identityProxy, postProxy, mediaProxy, searchProxy };
