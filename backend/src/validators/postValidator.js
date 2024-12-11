const Joi = require("joi");
const { createValidationError } = require("../utils/errorHandler");

// Post schema validation
const postSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),

  content: Joi.string().min(10).max(50000).required().messages({
    "string.min": "Content must be at least 10 characters long",
    "string.max": "Content cannot exceed 50000 characters",
    "any.required": "Content is required",
  }),

  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),

  tags: Joi.array().items(Joi.string().min(2).max(30)).max(5).messages({
    "array.max": "Cannot add more than 5 tags",
    "string.min": "Tag must be at least 2 characters long",
    "string.max": "Tag cannot exceed 30 characters",
  }),

  visibility: Joi.string()
    .valid("public", "private", "constituency")
    .default("public")
    .messages({
      "any.only": "Invalid visibility option",
    }),

  location: Joi.object({
    county: Joi.string(),
    constituency: Joi.string(),
    ward: Joi.string(),
  }),

  poll: Joi.object({
    question: Joi.string().min(5).max(200),
    options: Joi.array()
      .items(Joi.string().min(1).max(100))
      .min(2)
      .max(10)
      .when("question", {
        is: Joi.exist(),
        then: Joi.required(),
      }),
    endDate: Joi.date().greater("now"),
    allowMultipleVotes: Joi.boolean().default(false),
  }).optional(),

  media: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        type: Joi.string()
          .valid("image/jpeg", "image/png", "image/gif", "video/mp4")
          .required(),
      })
    )
    .max(4)
    .messages({
      "array.max": "Cannot upload more than 4 media files",
    }),
}).options({ stripUnknown: true });

// Comment schema validation
const commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    "string.min": "Comment cannot be empty",
    "string.max": "Comment cannot exceed 1000 characters",
    "any.required": "Comment content is required",
  }),

  parentId: Joi.string().optional().messages({
    "string.base": "Invalid parent comment ID",
  }),
});

// Report schema validation
const reportSchema = Joi.object({
  reason: Joi.string()
    .valid(
      "spam",
      "harassment",
      "hate_speech",
      "misinformation",
      "violence",
      "other"
    )
    .required()
    .messages({
      "any.only": "Invalid report reason",
      "any.required": "Report reason is required",
    }),

  details: Joi.string()
    .max(500)
    .when("reason", {
      is: "other",
      then: Joi.required(),
    })
    .messages({
      "string.max": "Details cannot exceed 500 characters",
      "any.required": 'Details are required when reason is "other"',
    }),
});

// Validate post
const validatePost = (data) => {
  const { error, value } = postSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

// Validate comment
const validateComment = (data) => {
  const { error, value } = commentSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

// Validate report
const validateReport = (data) => {
  const { error, value } = reportSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

module.exports = {
  validatePost,
  validateComment,
  validateReport,
};
