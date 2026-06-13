const User = require('../models/User');
const GuestCart = require('../models/GuestCart');

// @desc    Get current cart (User or Guest)
// @route   GET /api/cart
// @access  Public (Guest) or Private (User)
exports.getCart = async (req, res) => {
  try {
    let cart = [];
    
    if (req.user) {
      // Logged in user
      const user = await User.findById(req.user.id).populate('cart');
      if (user) {
        cart = user.cart;
      }
    } else {
      // Guest user
      const guestCart = await GuestCart.findOne({ visitorId: req.visitorId }).populate('cart');
      if (guestCart) {
        cart = guestCart.cart;
      }
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update/Sync current cart (User or Guest)
// @route   PUT /api/cart
// @access  Public (Guest) or Private (User)
exports.syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body; // Array of Jewellery ObjectIds

    let updatedCart = [];

    if (req.user) {
      // Update User cart
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { cart: cartItems || [] },
        { new: true, runValidators: true }
      ).populate('cart');
      
      if (user) updatedCart = user.cart;
    } else {
      // Update Guest cart
      let guestCart = await GuestCart.findOne({ visitorId: req.visitorId });
      
      if (guestCart) {
        guestCart.cart = cartItems || [];
        // Reset expiry on activity
        guestCart.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        await guestCart.save();
      } else {
        guestCart = await GuestCart.create({
          visitorId: req.visitorId,
          cart: cartItems || []
        });
      }
      
      const populatedCart = await GuestCart.findById(guestCart._id).populate('cart');
      updatedCart = populatedCart.cart;
    }

    res.status(200).json({
      success: true,
      data: updatedCart
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
