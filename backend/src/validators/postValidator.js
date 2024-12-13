const Joi = require("joi");

const postSchema = Joi.object({
  content: Joi.string().max(310).allow("", null),
  category: Joi.string()
    .valid(
      "general",
      "policy",
      "development",
      "education",
      "health",
      "environment",
      "governance",
      "other"
    )
    .default("general"),
  media: Joi.object({
    url: Joi.string(),
    type: Joi.string(),
  }).allow(null),
  location: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
    placeName: Joi.string(),
  }).allow(null),
}).custom((value, helpers) => {
  if (!value.content && !value.media) {
    return helpers.error("custom.empty", {
      message: "Post must contain either text or media",
    });
  }
  return value;
});

exports.validatePost = (data) => {
  const { error } = postSchema.validate(data);
  if (error) return error.details[0].message;
  return null;
};
