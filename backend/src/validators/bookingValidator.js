const { body, validationResult } = require('express-validator');

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

const validateCreateBooking = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isInt({ min: 1 }).withMessage('Event ID must be a positive integer')
    .toInt(),

  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2 }).withMessage('Customer name must be at least 2 characters'),

  body('customerEmail')
    .trim()
    .notEmpty().withMessage('Customer email is required')
    .isEmail().withMessage('Customer email must be a valid email address')
    .normalizeEmail(),

  body('customerPhone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .isLength({ min: 10 }).withMessage('Customer phone must be at least 10 digits')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Customer phone must contain only digits and +, -, spaces, or parentheses'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 10 }).withMessage('Quantity must be an integer between 1 and 10')
    .toInt(),

  handleValidationErrors,
];

module.exports = { validateCreateBooking };
