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
    trim: true
  },
  showInSection: {
    type: String,
    enum: ['category', 'type'],
    default: 'category'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
