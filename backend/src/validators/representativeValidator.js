const Joi = require("joi");

const representativeSchema = Joi.object({
  county: Joi.string().required(),
  constituency: Joi.string().required(),
  ward: Joi.string().required(),
  idNumber: Joi.string().required(),
  position: Joi.string().required(),
  party: Joi.string().required(),
  bio: Joi.string().min(50).max(500).required(),
  contacts: Joi.object({
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    office: Joi.string().optional(),
  }).required(),
  socialMedia: Joi.object({
    facebook: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional(),
    linkedin: Joi.string().uri().optional(),
  }).optional(),
});

const validateRepresentative = (data) => {
  return representativeSchema.validate(data);
};

module.exports = {
  validateRepresentative,
};
