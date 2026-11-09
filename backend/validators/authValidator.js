const ErrorResponse = require('../utils/errorHandler');

const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide all required fields (name, email, password)', 400));
  }
  if (typeof password !== 'string' || password.length < 6) {
    return next(new ErrorResponse('Password must be a string of at least 6 characters', 400));
  }
  next();
};

const validateLoginInput = (req, res, next) => {
  const identifier = req.body.emailOrPhone || req.body.mobile || req.body.phone || req.body.email;
  if (!identifier) {
    return next(new ErrorResponse('Please provide email or phone number', 400));
  }
  if (!req.body.password) {
    return next(new ErrorResponse('Please provide password', 400));
  }
  req.body.emailOrPhone = identifier;
  next();
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
