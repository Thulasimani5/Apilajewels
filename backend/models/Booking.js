const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingCustomId: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  visitorId: {
    type: String,
    required: false
  },
  jewelleryIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Jewellery',
    required: false
  }],
  tempJewelleries: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      default: ''
    },
    rentalPrice: {
      type: Number,
      default: 0
    },
    deposit: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    }
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  },
  eventDate: {
    type: Date
  },
  pickupDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'inevent', 'completed', 'rejected', 'approved'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  bookingPlace: {
    type: String,
    default: ''
  },
  rentalAmount: {
    type: Number,
    default: 0
  },
  discountPercent: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  advancePaid: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  customerDetails: {
    name: String,
    phone: String,
    address: String
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
