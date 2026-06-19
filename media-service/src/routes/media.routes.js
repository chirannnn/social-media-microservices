const express = require("express");
const multer = require("multer");

const {
  uploadMedia,
  getAllMedias,
} = require("../controllers/media.controller");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/multerMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

router.post("/upload", authenticateRequest, uploadMiddleware, uploadMedia);
router.get("/get", authenticateRequest, getAllMedias);

module.exports = router;
