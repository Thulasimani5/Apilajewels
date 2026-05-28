const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, mobile, role } = req.body;

    const phoneNumber = phone || mobile;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'Please provide a mobile number and password' });
    }

    // Create user
    const user = await User.create({
      name: name || 'Customer',
      email: email || undefined,
      password,
      phone: phoneNumber,
      role: role || 'user'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, mobile, phone } = req.body;

    const identifier = email || mobile || phone;

    // Validate identifier & password
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Please provide a mobile number and password' });
    }

    // Check for user (supports both email and phone login)
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all users (with populated cart items)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate('cart');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update/Sync user cart items in database
// @route   PUT /api/auth/cart
// @access  Private
exports.updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body; // Expects an array of Jewellery ObjectIds

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cart: cartItems || [] },
      { new: true, runValidators: true }
    ).populate('cart');

    res.status(200).json({
      success: true,
      data: user.cart
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
