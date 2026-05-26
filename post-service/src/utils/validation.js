const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(5).max(5000).required(),
    mediaIds: Joi.array(),
  });

  return schema.validate(data);
};

module.exports = { validateCreatePost };
