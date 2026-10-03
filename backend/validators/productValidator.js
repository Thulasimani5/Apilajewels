const ErrorResponse = require('../utils/errorHandler');

const validateProductCreate = (req, res, next) => {
  const { jewelId, name, price, description } = req.body;
  if (!jewelId) return next(new ErrorResponse('Jewel ID is required', 400));
  if (!name) return next(new ErrorResponse('Product name is required', 400));
  if (price === undefined || price === null || isNaN(price)) return next(new ErrorResponse('Valid price is required', 400));
  if (!description) return next(new ErrorResponse('Product description is required', 400));
  next();
};

module.exports = {
  validateProductCreate
};
