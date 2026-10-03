const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const cartRepository = require('../repositories/cartRepository');
const ErrorResponse = require('../utils/errorHandler');

class AuthService {
  getSignedJwtToken(id) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is missing.');
    }
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
  }

  async registerUser(userData, visitorId) {
    const { name, email, phone, password, role } = userData;

    if (!phone) {
      throw new ErrorResponse('Please provide a phone number', 400);
    }
    if (!password || password.length < 6) {
      throw new ErrorResponse('Password must be at least 6 characters long', 400);
    }

    const existingUser = await userRepository.findByPhone(phone);
    if (existingUser) {
      throw new ErrorResponse('User with this phone number already exists', 400);
    }

    const user = await userRepository.create({
      name,
      email: email || undefined,
      phone,
      password,
      role: role || 'user'
    });

    // Merge guest cart if visitorId is present
    if (visitorId) {
      const guestCart = await cartRepository.findByVisitorId(visitorId);
      if (guestCart && guestCart.cart && guestCart.cart.length > 0) {
        const guestItemIds = guestCart.cart.map(item => item._id || item);
        const mergedCart = Array.from(new Set([...(user.cart || []).map(id => id.toString()), ...guestItemIds.map(id => id.toString())]));
        await userRepository.updateCart(user._id, mergedCart);
        await cartRepository.deleteGuestCart(visitorId);
      }
    }

    const token = this.getSignedJwtToken(user._id);
    const updatedUser = await userRepository.findById(user._id);

    return { token, user: updatedUser };
  }

  async loginUser({ emailOrPhone, password }, visitorId) {
    if (!emailOrPhone || !password) {
      throw new ErrorResponse('Please provide email/phone and password', 400);
    }

    let user = await userRepository.findByPhone(emailOrPhone);
    if (!user) {
      user = await userRepository.findByEmail(emailOrPhone);
    }

    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Merge guest cart if visitorId is present
    if (visitorId) {
      const guestCart = await cartRepository.findByVisitorId(visitorId);
      if (guestCart && guestCart.cart && guestCart.cart.length > 0) {
        const guestItemIds = guestCart.cart.map(item => item._id || item);
        const mergedCart = Array.from(new Set([...(user.cart || []).map(id => id.toString()), ...guestItemIds.map(id => id.toString())]));
        await userRepository.updateCart(user._id, mergedCart);
        await cartRepository.deleteGuestCart(visitorId);
      }
    }

    const token = this.getSignedJwtToken(user._id);
    const populatedUser = await userRepository.findById(user._id);

    return { token, user: populatedUser };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    return user;
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }
}

module.exports = new AuthService();
