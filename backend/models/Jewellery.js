const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, { _id: false });

const JewellerySchema = new mongoose.Schema({
  jewelId: {
    type: String,
    required: [true, 'Please add a jewel ID'],
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  category: {
    type: [String],
    required: [true, 'Please add a category'],
    default: [],
    index: true
  },
  type: {
    type: [String],
    required: [true, 'Please add a type'],
    default: [],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  deposit: {
    type: Number,
    required: [true, 'Please add a deposit amount']
  },
  stoneName: {
    type: [String],
    default: [],
    enum: ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Polki Diamond", "Rose Quartz", "Green Onyx"],
    index: true
  },
  stoneColour: {
    type: [String],
    default: []
  },
  colour: {
    type: String,
    required: [true, 'Please add a colour']
  },
  occasion: {
    type: [String],
    enum: ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"],
    default: [],
    index: true
  },
  accessoryType: {
    type: String,
    enum: ['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories', 'Bracelet', 'Others'],
    default: null,
    set: v => (!v || v === '' || v === 'null' || v === 'undefined' ? null : v),
    index: true
  },
  material: {
    type: String,
    default: 'Premium Alloy'
  },
  size: {
    type: String,
    default: 'Adjustable'
  },
  finish: {
    type: String,
    default: 'Antique'
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  images: {
    type: [MediaSchema],
    default: []
  },
  availability: {
    type: Boolean,
    default: true,
    index: true
  },
  popularity: {
    type: Number,
    default: 0,
    index: true
  },
  showPrice: {
    type: Boolean,
    default: true
  },
  purchaseAmount: {
    type: Number,
    default: null
  },
  rentAmount: {
    type: Number,
    default: null
  },
  salesAmount: {
    type: Number,
    default: null
  },
  shopName: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
JewellerySchema.index({ name: 'text', jewelId: 'text', description: 'text' });

// Virtual properties for backward compatibility with frontend code
JewellerySchema.virtual('rentalPrice').get(function() {
  return this.price;
}).set(function(val) {
  this.price = val;
});

JewellerySchema.virtual('code').get(function() {
  return this.jewelId;
}).set(function(val) {
  this.jewelId = val;
});

module.exports = mongoose.model('Jewellery', JewellerySchema);
