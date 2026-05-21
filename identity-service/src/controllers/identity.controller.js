const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");

const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    // validate the schema
    const { error, value } = validateRegistration(req.body);

    if (error) {
      logger.warn(`Validation error : ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, email, password } = value;

    let user = await User.findOne({ $or: [{ username }, { email }] });

    if (user) {
      let message = "User already exists";

      if (user.email === email) message = "Email already in use";
      else if (user.username === username) message = "Username already taken";

      return res.status(400).json({
        success: false,
        message,
      });
    }

    user = new User({ username, email, password });

    await user.save();

    logger.info(`User saved successfully: ${user._id}`);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("Login endpoint hit...");

  try {
    const { error, value } = validateLogin(req.body);
    if (error) {
      logger.warn(`Validation error : ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid User");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Login error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storeToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storeToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (storeToken.expiresAt < new Date()) {
      logger.warn("Refesh token expired");
      await RefreshToken.deleteOne({ _id: storeToken._id });

      return res.status(401).json({
        success: false,
        message: "Refesh token expired",
      });
    }

    const user = await User.findById(storeToken.user);

    if (!user) {
      logger.warn("User not found");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    await storeToken.deleteOne();

    const { accessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storeToken = await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

    if (!storeToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    logger.info("Refresh token deleted for logout");

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    logger.error("Logout error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };
