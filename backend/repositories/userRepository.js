const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id).populate('cart');
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findByPhone(phone) {
    return await User.findOne({ phone }).select('+password');
  }

  async create(userData) {
    return await User.create(userData);
  }

  async findAll() {
    return await User.find({}).populate('cart').sort('-createdAt');
  }

  async updateCart(userId, cartArray) {
    return await User.findByIdAndUpdate(userId, { cart: cartArray }, { new: true }).populate('cart');
  }
}

module.exports = new UserRepository();
