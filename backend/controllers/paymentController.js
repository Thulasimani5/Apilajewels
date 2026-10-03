const paymentService = require('../services/paymentService');

/**
 * @desc    Get payment summary for a booking
 * @route   GET /api/payments/booking/:bookingId
 * @access  Private
 */
exports.getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await paymentService.getPaymentSummary(req.params.bookingId);
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Record payment for a booking
 * @route   POST /api/payments/record
 * @access  Private (Admin)
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, notes, paymentMethod } = req.body;
    const booking = await paymentService.recordPayment(
      bookingId,
      { amount, notes, paymentMethod },
      req.user
    );
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Gateway Payment Order (Razorpay/Stripe placeholder)
 * @route   POST /api/payments/create-order
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId, gateway } = req.body;
    const order = await paymentService.createPaymentGatewayOrder(bookingId, gateway);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};
