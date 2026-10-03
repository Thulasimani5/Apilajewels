const bookingRepository = require('../repositories/bookingRepository');
const ErrorResponse = require('../utils/errorHandler');

class PaymentService {
  /**
   * Calculate payment summary for a booking
   */
  async getPaymentSummary(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ErrorResponse('Booking not found', 404);
    }

    const totalAmount = booking.totalAmount || 0;
    const advancePaid = booking.advancePaid || 0;
    const depositAmount = booking.depositAmount || 0;
    const balanceAmount = Math.max(0, totalAmount - advancePaid);

    let status = 'Pending';
    if (advancePaid >= totalAmount && totalAmount > 0) {
      status = 'Paid';
    } else if (advancePaid > 0) {
      status = 'Partial';
    }

    return {
      bookingId: booking._id,
      bookingCustomId: booking.bookingCustomId,
      totalAmount,
      advancePaid,
      balanceAmount,
      depositAmount,
      paymentStatus: status,
      customerDetails: booking.customerDetails
    };
  }

  /**
   * Record a manual payment against a booking (Advance / Full payment)
   */
  async recordPayment(bookingId, { amount, notes, paymentMethod = 'Manual' }, adminUser = null) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new ErrorResponse('Booking not found', 404);
    }

    const paymentAmount = parseFloat(amount) || 0;
    if (paymentAmount <= 0) {
      throw new ErrorResponse('Payment amount must be greater than zero', 400);
    }

    const newAdvancePaid = (booking.advancePaid || 0) + paymentAmount;
    const totalAmount = booking.totalAmount || 0;
    const newBalanceAmount = Math.max(0, totalAmount - newAdvancePaid);

    let newPaymentStatus = 'Pending';
    if (newAdvancePaid >= totalAmount && totalAmount > 0) {
      newPaymentStatus = 'Paid';
    } else if (newAdvancePaid > 0) {
      newPaymentStatus = 'Partial';
    }

    booking.advancePaid = newAdvancePaid;
    booking.balanceAmount = newBalanceAmount;
    booking.paymentStatus = newPaymentStatus;
    if (notes) {
      booking.notes = (booking.notes ? `${booking.notes}\n` : '') + `[Payment ₹${paymentAmount} via ${paymentMethod}]: ${notes}`;
    }

    await booking.save();
    return booking;
  }

  /**
   * Placeholder interface for future Razorpay / Stripe Order Creation
   */
  async createPaymentGatewayOrder(bookingId, gateway = 'razorpay') {
    const summary = await this.getPaymentSummary(bookingId);
    
    // Future Razorpay/Stripe integration point
    return {
      gateway,
      orderId: `ORDER_${summary.bookingCustomId}_${Date.now()}`,
      amount: summary.balanceAmount > 0 ? summary.balanceAmount : summary.totalAmount,
      currency: 'INR',
      status: 'created',
      metadata: {
        bookingId: summary.bookingId,
        customerName: summary.customerDetails?.name
      }
    };
  }
}

module.exports = new PaymentService();
