const express = require("express");
const multer = require("multer");

const { uploadMedia } = require("../controllers/media.controller");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/multerMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

router.post("/upload", authenticateRequest, uploadMiddleware, uploadMedia);

module.exports = router;
