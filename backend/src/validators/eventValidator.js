const { body, validationResult } = require('express-validator');

/** Inline middleware that short-circuits with 400 if any rule failed */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error:   'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateCreateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),

  body('description')
    .optional()
    .trim(),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('venue')
    .trim()
    .notEmpty().withMessage('Venue is required'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('eventDate')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Event date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('totalSeats')
    .notEmpty().withMessage('Total seats is required')
    .isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Image URL must be a valid URL'),

  handleValidationErrors,
];

module.exports = { validateCreateEvent };
