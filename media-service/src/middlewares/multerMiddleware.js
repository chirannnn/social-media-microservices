const multer = require("multer");
const logger = require("../utils/logger");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error while uploading", err.message);

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err) {
      logger.error("Unknown upload error", err.message);

      return res.status(500).json({
        success: false,
        message: "Error uploading file",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;
