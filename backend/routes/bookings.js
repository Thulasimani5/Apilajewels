const express = require('express');
const {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const visitorMiddleware = require('../middleware/visitor');
const { validateBookingCreate } = require('../validators/bookingValidator');

const router = express.Router();

router.use(visitorMiddleware);

router.route('/')
  .get(optionalAuth, getBookings)
  .post(optionalAuth, validateBookingCreate, createBooking);

router.get('/my-bookings', protect, getMyBookings);

router.route('/:id')
  .get(optionalAuth, getBooking)
  .put(protect, authorize('admin'), updateBooking)
  .delete(protect, authorize('admin'), deleteBooking);

router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
