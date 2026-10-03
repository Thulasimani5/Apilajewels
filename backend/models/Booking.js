const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingCustomId: {
    type: String,
    default: '',
    index: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  visitorId: {
    type: String,
    required: false,
    index: true
  },
  jewelleryIds: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Jewellery',
    required: false,
    index: true
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
    default: Date.now,
    index: true
  },
  eventDate: {
    type: Date,
    index: true
  },
  pickupDate: {
    type: Date,
    index: true
  },
  returnDate: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'inevent', 'completed', 'rejected', 'approved'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending',
    index: true
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

// Compound index for booking conflict checks
BookingSchema.index({ jewelleryIds: 1, status: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
