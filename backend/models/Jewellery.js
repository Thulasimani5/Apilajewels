const mongoose = require('mongoose');

const JewellerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  code: {
    type: String,
    required: [true, 'Please add a code'],
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Please add a type (e.g., Necklace Set, Choker)']
  },
  colour: {
    type: String,
    required: [true, 'Please add a colour']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  images: {
    type: [String],
    default: []
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Please add a rental price']
  },
  bookedDates: {
    type: [Date],
    default: []
  },
  availability: {
    type: Boolean,
    default: true
  },
  material: {
    type: String,
    default: 'Brass'
  },
  finish: {
    type: String,
    default: 'Mehndi Polish'
  }
}, { timestamps: true });

module.exports = mongoose.model('Jewellery', JewellerySchema);
