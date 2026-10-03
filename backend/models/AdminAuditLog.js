const mongoose = require('mongoose');

const AdminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  adminEmail: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_PRODUCT',
      'UPDATE_PRODUCT',
      'PATCH_PRODUCT_FIELD',
      'DELETE_PRODUCT',
      'CREATE_BOOKING',
      'UPDATE_BOOKING',
      'UPDATE_BOOKING_STATUS',
      'DELETE_BOOKING',
      'CREATE_CATEGORY',
      'UPDATE_CATEGORY',
      'DELETE_CATEGORY'
    ],
    index: true
  },
  entity: {
    type: String,
    required: true,
    enum: ['Jewellery', 'Booking', 'Category', 'User'],
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminAuditLog', AdminAuditLogSchema);
