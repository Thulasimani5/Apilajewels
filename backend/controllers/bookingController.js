const Booking = require('../models/Booking');
const Jewellery = require('../models/Jewellery');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query;

    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query = Booking.find({ userId: req.user.id }).populate({
        path: 'jewelleryIds',
        select: 'name code images rentalPrice'
      });
    } else {
      query = Booking.find().populate({
        path: 'jewelleryIds',
        select: 'name code images rentalPrice'
      }).populate({
        path: 'userId',
        select: 'name email phone'
      });
    }

    const bookings = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('jewelleryIds')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Make sure user owns booking or is admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to access this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    req.body.userId = req.user.id;

    // Optional: Check if all jewellery items are available for the date
    // This requires complex date checking logic, we'll implement a simple creation for now

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this booking' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
