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
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  type: {
    type: String,
    required: [true, 'Please add a type'],
    enum: ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"]
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  deposit: {
    type: Number,
    required: [true, 'Please add a deposit amount']
  },
  stones: {
    type: [String],
    default: [],
    enum: ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Polki Diamond", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia"]
  },
  colour: {
    type: String,
    required: [true, 'Please add a colour']
  },
  occasion: {
    type: [String],
    default: []
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
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

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
