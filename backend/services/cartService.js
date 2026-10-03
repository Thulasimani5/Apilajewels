const userRepository = require('../repositories/userRepository');
const cartRepository = require('../repositories/cartRepository');
const jewelleryRepository = require('../repositories/jewelleryRepository');
const ErrorResponse = require('../utils/errorHandler');

class CartService {
  async getCart(user, visitorId) {
    if (user) {
      const dbUser = await userRepository.findById(user._id);
      return dbUser ? dbUser.cart : [];
    }
    if (visitorId) {
      const guestCart = await cartRepository.findByVisitorId(visitorId);
      return guestCart ? guestCart.cart : [];
    }
    return [];
  }

  async addToCart(user, visitorId, jewelleryId) {
    if (!jewelleryId) {
      throw new ErrorResponse('Jewellery ID is required', 400);
    }
    const jewel = await jewelleryRepository.findById(jewelleryId);
    if (!jewel) {
      throw new ErrorResponse('Jewellery item not found', 404);
    }

    if (user) {
      const dbUser = await userRepository.findById(user._id);
      const currentCart = dbUser.cart ? dbUser.cart.map(i => i._id.toString()) : [];
      if (!currentCart.includes(jewelleryId)) {
        currentCart.push(jewelleryId);
      }
      const updatedUser = await userRepository.updateCart(user._id, currentCart);
      return updatedUser.cart;
    }

    if (visitorId) {
      const guestCart = await cartRepository.findByVisitorId(visitorId);
      const currentCart = guestCart && guestCart.cart ? guestCart.cart.map(i => i._id.toString()) : [];
      if (!currentCart.includes(jewelleryId)) {
        currentCart.push(jewelleryId);
      }
      const updatedGuestCart = await cartRepository.upsertGuestCart(visitorId, currentCart);
      return updatedGuestCart.cart;
    }

    throw new ErrorResponse('Session identification failed', 400);
  }

  async removeFromCart(user, visitorId, jewelleryId) {
    if (!jewelleryId) {
      throw new ErrorResponse('Jewellery ID is required', 400);
    }

    if (user) {
      const dbUser = await userRepository.findById(user._id);
      const currentCart = dbUser.cart ? dbUser.cart.map(i => i._id.toString()).filter(id => id !== jewelleryId) : [];
      const updatedUser = await userRepository.updateCart(user._id, currentCart);
      return updatedUser.cart;
    }

    if (visitorId) {
      const guestCart = await cartRepository.findByVisitorId(visitorId);
      const currentCart = guestCart && guestCart.cart ? guestCart.cart.map(i => i._id.toString()).filter(id => id !== jewelleryId) : [];
      const updatedGuestCart = await cartRepository.upsertGuestCart(visitorId, currentCart);
      return updatedGuestCart.cart;
    }

    return [];
  }

  async clearCart(user, visitorId) {
    if (user) {
      const updatedUser = await userRepository.updateCart(user._id, []);
      return updatedUser.cart;
    }
    if (visitorId) {
      await cartRepository.deleteGuestCart(visitorId);
      return [];
    }
    return [];
  }

  async syncCart(user, visitorId, cartArray) {
    const validCart = Array.isArray(cartArray) ? cartArray : [];

    if (user) {
      const updatedUser = await userRepository.updateCart(user._id, validCart);
      return updatedUser.cart;
    }

    if (visitorId) {
      const updatedGuestCart = await cartRepository.upsertGuestCart(visitorId, validCart);
      return updatedGuestCart.cart;
    }

    return [];
  }

  async getAllGuestCarts() {
    return await cartRepository.findAllGuestCarts();
  }
}

module.exports = new CartService();
