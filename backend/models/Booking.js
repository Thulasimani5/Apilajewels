const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  jewelleryIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Jewellery',
    required: true
  }],
  bookingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  customerDetails: {
    name: String,
    phone: String,
    address: String
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
