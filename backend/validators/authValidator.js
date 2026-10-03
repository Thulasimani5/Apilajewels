const ErrorResponse = require('../utils/errorHandler');

const validateRegisterInput = (req, res, next) => {
  const { phone, password } = req.body;
  if (!phone) {
    return next(new ErrorResponse('Please provide a phone number', 400));
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ErrorResponse('Password must be a string of at least 6 characters', 400));
  }
  next();
};

const validateLoginInput = (req, res, next) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone) {
    return next(new ErrorResponse('Please provide email or phone number', 400));
  }
  if (!password) {
    return next(new ErrorResponse('Please provide password', 400));
  }
  next();
};

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
