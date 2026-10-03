const authService = require('../services/authService');
const cartService = require('../services/cartService');
const { formatError } = require('../utils/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, mobile, role } = req.body;
    const phoneNumber = phone || mobile;

    const { token, user } = await authService.registerUser(
      { name: name || 'Customer', email, phone: phoneNumber, password, role },
      req.visitorId
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.phone,
        role: user.role,
        cart: user.cart
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, mobile, phone } = req.body;
    const identifier = email || mobile || phone;

    const { token, user } = await authService.loginUser(
      { emailOrPhone: identifier, password },
      req.visitorId
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.phone,
        role: user.role,
        cart: user.cart
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Email-only login (Passwordless)
// @route   POST /api/auth/email-login
// @access  Public
exports.emailLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const dummyPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const dummyPhone = '0000000000';

    const { token, user } = await authService.registerUser(
      { name: email.split('@')[0], email, phone: dummyPhone, password: dummyPassword, role: 'user' },
      req.visitorId
    ).catch(async () => {
      return await authService.loginUser({ emailOrPhone: email, password: dummyPassword }, req.visitorId);
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.phone,
        role: user.role,
        cart: user.cart
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get all users (with populated cart items)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update/Sync user cart items in database
// @route   PUT /api/auth/cart
// @access  Private
exports.updateCart = async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    const updatedCart = await cartService.syncCart(req.user, null, cartItems || []);
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};
