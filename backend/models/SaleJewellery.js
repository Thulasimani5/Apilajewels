const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  }
}, { _id: false });

const SaleJewellerySchema = new mongoose.Schema({
  jewelId: {
    type: String,
    required: [true, 'Please add a jewel ID'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  purchaseAmount: {
    type: Number,
    required: [true, 'Please add a purchase amount'],
    min: [0, 'Purchase amount cannot be negative']
  },
  salesPrice: {
    type: Number,
    required: [true, 'Please add a sales price'],
    min: [0, 'Sales price cannot be negative']
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  discountedRate: {
    type: Number,
    required: [true, 'Please add a discounted rate'],
    min: [0, 'Discounted rate cannot be negative']
  },
  colour: {
    type: String,
    required: [true, 'Please select a colour'],
    trim: true
  },
  material: {
    type: String,
    default: null,
    trim: true
  },
  size: {
    type: String,
    default: null,
    trim: true
  },
  finish: {
    type: String,
    default: null,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true
  },
  stockCount: {
    type: Number,
    default: 1,
    min: [0, 'Stock count cannot be negative']
  },
  images: {
    type: [MediaSchema],
    default: []
  },
  isSale: {
    type: Boolean,
    default: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SaleJewellery', SaleJewellerySchema);

