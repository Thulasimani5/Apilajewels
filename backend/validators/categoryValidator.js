const ErrorResponse = require('../utils/errorHandler');

const validateCategoryCreate = (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return next(new ErrorResponse('Category name is required', 400));
  }
  next();
};

module.exports = {
  validateCategoryCreate
};
