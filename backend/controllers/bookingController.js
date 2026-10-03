const bookingService = require('../services/bookingService');
const { formatError } = require('../utils/errorHandler');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private / Optional Admin
exports.getBookings = async (req, res, next) => {
  try {
    let bookings;
    if (req.user && req.user.role === 'admin') {
      bookings = await bookingService.getAllBookings();
    } else if (req.user) {
      bookings = await bookingService.getUserBookings(req.user.id);
    } else {
      bookings = await bookingService.getAllBookings();
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get user's personal bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(err.statusCode || 404).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Create new booking (Logged-in User or Guest Visitor)
// @route   POST /api/bookings
// @access  Public / Optional Auth
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user, req.visitorId);
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await bookingService.updateBookingStatus(req.params.id, { status, paymentStatus }, req.user);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res, next) => {
  try {
    await bookingService.deleteBooking(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};
