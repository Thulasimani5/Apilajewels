const Booking = require('../models/Booking');
const Jewellery = require('../models/Jewellery');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private / Optional Admin
exports.getBookings = async (req, res) => {
  try {
    let query;

    // If user is not admin, only show their bookings or guest bookings
    if (!req.user || req.user.role !== 'admin') {
      const matchConditions = [];
      if (req.user) matchConditions.push({ userId: req.user.id });
      if (req.visitorId) matchConditions.push({ visitorId: req.visitorId });
      
      query = Booking.find(matchConditions.length > 0 ? { $or: matchConditions } : {}).populate({
        path: 'jewelleryIds',
        select: 'name code jewelId images rentalPrice price'
      });
    } else {
      query = Booking.find().populate({
        path: 'jewelleryIds',
        select: 'name code jewelId images rentalPrice price'
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

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new booking (Logged-in User or Guest Visitor)
// @route   POST /api/bookings
// @access  Public / Optional Auth
exports.createBooking = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      req.body.userId = req.user.id;
    }
    if (req.visitorId) {
      req.body.visitorId = req.visitorId;
    }
    if (!req.body.bookingDate) {
      req.body.bookingDate = new Date();
    }

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
    }).populate({
      path: 'jewelleryIds',
      select: 'name code jewelId images rentalPrice price'
    }).populate({
      path: 'userId',
      select: 'name email phone'
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this booking' });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
