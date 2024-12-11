const Joi = require("joi");
const { createValidationError } = require("../utils/errorHandler");

// Registration schema
const registrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 100 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Please confirm your password",
  }),

  role: Joi.string()
    .valid("citizen", "representative", "admin")
    .default("citizen")
    .messages({
      "any.only": "Invalid role specified",
    }),

  phoneNumber: Joi.string()
    .pattern(/^(?:\+254|0)[17]\d{8}$/)
    .messages({
      "string.pattern.base": "Please provide a valid Kenyan phone number",
    }),

  county: Joi.string()
    .when("role", {
      is: "representative",
      then: Joi.required(),
    })
    .messages({
      "any.required": "County is required for representatives",
    }),

  constituency: Joi.string()
    .when("role", {
      is: "representative",
      then: Joi.required(),
    })
    .messages({
      "any.required": "Constituency is required for representatives",
    }),

  ward: Joi.string()
    .when("role", {
      is: "representative",
      then: Joi.required(),
    })
    .messages({
      "any.required": "Ward is required for representatives",
    }),
}).options({ stripUnknown: true });

// Profile update schema
const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
  }),

  phoneNumber: Joi.string()
    .pattern(/^(?:\+254|0)[17]\d{8}$/)
    .messages({
      "string.pattern.base": "Please provide a valid Kenyan phone number",
    }),

  county: Joi.string(),
  constituency: Joi.string(),
  ward: Joi.string(),

  bio: Joi.string().max(500).messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),

  avatar: Joi.any(),

  settings: Joi.object({
    emailNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean(),
    language: Joi.string().valid("en", "sw"),
    theme: Joi.string().valid("light", "dark", "system"),
  }),
}).options({ stripUnknown: true });

// Password change schema
const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 100 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      "any.required": "New password is required",
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Please confirm your new password",
    }),
}).options({ stripUnknown: true });

// Verification request schema
const verificationRequestSchema = Joi.object({
  documentType: Joi.string()
    .valid("national_id", "passport", "voters_card")
    .required()
    .messages({
      "any.only": "Invalid document type",
      "any.required": "Document type is required",
    }),

  documentNumber: Joi.string().required().messages({
    "any.required": "Document number is required",
  }),

  documentImage: Joi.any().required().messages({
    "any.required": "Document image is required",
  }),

  selfieImage: Joi.any().required().messages({
    "any.required": "Selfie image is required",
  }),
}).options({ stripUnknown: true });

// Validate registration
const validateRegistration = (data) => {
  const { error, value } = registrationSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

// Validate profile update
const validateProfileUpdate = (data) => {
  const { error, value } = profileUpdateSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

// Validate password change
const validatePasswordChange = (data) => {
  const { error, value } = passwordChangeSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

// Validate verification request
const validateVerificationRequest = (data) => {
  const { error, value } = verificationRequestSchema.validate(data);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  return value;
};

module.exports = {
  validateRegistration,
  validateProfileUpdate,
  validatePasswordChange,
  validateVerificationRequest,
};
