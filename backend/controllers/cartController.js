const cartService = require('../services/cartService');
const { formatError } = require('../utils/errorHandler');

// @desc    Get current cart (User or Guest)
// @route   GET /api/cart
// @access  Public (Guest) or Private (User)
exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user, req.visitorId);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update/Sync current cart (User or Guest)
// @route   PUT /api/cart
// @access  Public (Guest) or Private (User)
exports.syncCart = async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    const updatedCart = await cartService.syncCart(req.user, req.visitorId, cartItems || []);
    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get all guest carts (Admin)
// @route   GET /api/cart/all-guests
// @access  Private/Admin
exports.getAllGuestCarts = async (req, res, next) => {
  try {
    const guestCarts = await cartService.getAllGuestCarts();
    res.status(200).json({
      success: true,
      count: guestCarts.length,
      data: guestCarts
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};
