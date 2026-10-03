const ErrorResponse = require('../utils/errorHandler');

const validateBookingCreate = (req, res, next) => {
  const { customerDetails, jewelleryIds, tempJewelleries, pickupDate, eventDate, returnDate } = req.body;

  const regularItems = Array.isArray(jewelleryIds) ? jewelleryIds : [];
  const tempItems = Array.isArray(tempJewelleries) ? tempJewelleries : [];

  if (regularItems.length === 0 && tempItems.length === 0) {
    return next(new ErrorResponse('Please select at least one jewellery item or temporary item', 400));
  }

  if (customerDetails && typeof customerDetails === 'object') {
    if (!customerDetails.name && !customerDetails.phone) {
      return next(new ErrorResponse('Customer details (name or phone) are required', 400));
    }
  }

  if (pickupDate && eventDate && new Date(pickupDate) > new Date(eventDate)) {
    return next(new ErrorResponse('Pickup date must be on or before event date', 400));
  }

  if (eventDate && returnDate && new Date(eventDate) > new Date(returnDate)) {
    return next(new ErrorResponse('Event date must be on or before return date', 400));
  }

  if (pickupDate && returnDate && new Date(pickupDate) > new Date(returnDate)) {
    return next(new ErrorResponse('Pickup date must be on or before return date', 400));
  }

  next();
};

module.exports = {
  validateBookingCreate
};
