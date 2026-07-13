const Post = require("../models/Post");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const { invalidateCacheByPattern } = require("../utils/cache");
const { publishEvent } = require("../utils/rabbitmq");

const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    const { error, value } = validateCreatePost(req.body);
    if (error) {
      logger.warn(`Validation error : ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = value;

    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newPost.save();

     await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: newPost.user.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });

    await invalidateCacheByPattern(req.redisClient, "posts:*");

    logger.info(`Post created successfully: ${newPost._id}`);
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error(`Error creating post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

const getAllPosts = async (req, res) => {
  logger.info("Fetch all posts endpoint hit");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      logger.info("All posts fetched from cache");
      return res.status(200).json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    logger.info("All posts fetched from DB");
    res.status(200).json({
      result,
    });
  } catch (error) {
    logger.error(`Error Fetching all posts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching all posts",
    });
  }
};

const getPost = async (req, res) => {
  logger.info("Fetch a single post endpoint hit");
  try {
    const postId = req.params.id;

    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      logger.info("Single post fetched from cache");
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const post = await Post.findById(postId);

    if (!post) {
      logger.warn(`Post not found : ${postId}`);
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));

    logger.info("Single post fetched from DB");
    res.status(200).json({
      post,
    });
  } catch (error) {
    logger.error(`Error Fetching a single post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error Fetching a single post",
    });
  }
};

const deletePost = async (req, res) => {
  logger.info("Delete post endpoint hit");
  try {
    const postId = req.params.id;

    const deletedPost = await Post.findOneAndDelete({
      _id: postId,
      user: req.user.userId,
    });

    if (!deletedPost) {
      logger.warn(`Post not found: ${postId}`);

      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // publish post delete method
    await publishEvent("post.deleted", {
      postId: deletedPost._id.toString(),
      userId: req.user.userId,
      mediaIds: deletedPost.mediaIds,
    });

    await invalidateCacheByPattern(req.redisClient, `post:${postId}`);

    await invalidateCacheByPattern(req.redisClient, "posts:*");

    logger.info(`Post deleted successfully: ${postId}`);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting a post: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting a post",
    });
  }
};

module.exports = { createPost, getAllPosts, getPost, deletePost };
