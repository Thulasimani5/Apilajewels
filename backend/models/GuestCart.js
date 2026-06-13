const mongoose = require('mongoose');

const GuestCartSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jewellery'
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  }
}, { timestamps: true });

// TTL Index to automatically delete guest carts after 90 days
// We set expireAfterSeconds to 0 so it expires exactly at the expiresAt date.
GuestCartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestCart', GuestCartSchema);
