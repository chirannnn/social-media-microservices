const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");

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

module.exports = { registerUser };
