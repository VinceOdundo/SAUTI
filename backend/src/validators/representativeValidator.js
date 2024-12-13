const Joi = require('joi');

const representativeSchema = Joi.object({
  organization: Joi.string().required(),
  position: Joi.string().required(),
  department: Joi.string().required(),
  employeeId: Joi.string(),
  verificationDocuments: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      url: Joi.string().required()
    })
  ),
  specializations: Joi.array().items(Joi.string()),
  languages: Joi.array().items(Joi.string()),
  availability: Joi.object({
    days: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ),
    hours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    })
  }),
  contactPreferences: Joi.object({
    email: Joi.boolean(),
    phone: Joi.boolean(),
    inApp: Joi.boolean()
  })
});

const interactionSchema = Joi.object({
  category: Joi.string().valid('general', 'complaint', 'suggestion', 'inquiry', 'emergency', 'other'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  message: Joi.string().required().min(10).max(1000),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2),
    placeName: Joi.string()
  }),
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().required(),
      type: Joi.string().required(),
      name: Joi.string().required()
    })
  )
});

const appointmentSchema = Joi.object({
  date: Joi.date().greater('now').required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  purpose: Joi.string().required().min(10).max(500),
  location: Joi.object({
    type: Joi.string().valid('online', 'office', 'other'),
    details: Joi.string()
  }),
  notes: Joi.string().max(1000)
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(10).max(500),
  anonymous: Joi.boolean()
});

const availabilitySchema = Joi.object({
  schedule: Joi.object({
    monday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    tuesday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    wednesday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    thursday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    friday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    saturday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    ),
    sunday: Joi.array().items(
      Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      })
    )
  }),
  exceptions: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      available: Joi.boolean().required(),
      reason: Joi.string()
    })
  ),
  timezone: Joi.string().required()
});

module.exports = {
  validateRepresentative: (data) => representativeSchema.validate(data),
  validateInteraction: (data) => interactionSchema.validate(data),
  validateAppointment: (data) => appointmentSchema.validate(data),
  validateReview: (data) => reviewSchema.validate(data),
  validateAvailability: (data) => availabilitySchema.validate(data)
};
