const { body, validationResult } = require('express-validator');

const validateBooking = [
  body('sessionId').notEmpty().withMessage('Session ID is required.'),
  body('userId').notEmpty().withMessage('User ID is required.'),
  body('time').notEmpty().withMessage('Booking time is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateBooking;