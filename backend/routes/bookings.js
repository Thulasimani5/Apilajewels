const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const visitorMiddleware = require('../middleware/visitor');

const router = express.Router();

router.use(visitorMiddleware);

router.route('/')
  .get(optionalAuth, getBookings)
  .post(optionalAuth, createBooking);

router.route('/:id')
  .get(optionalAuth, getBooking)
  .put(protect, authorize('admin'), updateBooking)
  .delete(protect, authorize('admin'), deleteBooking);

module.exports = router;
