const Post = require("../models/Post");
const logger = require("../utils/logger");

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    const { content, medisIds } = req.body;

    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: medisIds || [],
    });

    await newPost.save();

    logger.info("Post created successfully", newPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

module.exports = { createPost };
