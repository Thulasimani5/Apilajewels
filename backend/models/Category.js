const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  image: {
    type: String
  },
  subtext: {
    type: String,
    required: [true, 'Please add a category subtext'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
