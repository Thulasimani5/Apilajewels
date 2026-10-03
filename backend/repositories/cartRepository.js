const GuestCart = require('../models/GuestCart');

class CartRepository {
  async findByVisitorId(visitorId) {
    return await GuestCart.findOne({ visitorId }).populate('cart');
  }

  async upsertGuestCart(visitorId, cartArray) {
    return await GuestCart.findOneAndUpdate(
      { visitorId },
      { cart: cartArray, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      { new: true, upsert: true }
    ).populate('cart');
  }

  async deleteGuestCart(visitorId) {
    return await GuestCart.findOneAndDelete({ visitorId });
  }

  async findAllGuestCarts() {
    return await GuestCart.find({}).populate('cart').sort('-updatedAt');
  }
}

module.exports = new CartRepository();
