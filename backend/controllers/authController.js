const User = require('../models/User');
const GuestCart = require('../models/GuestCart');
const jwt = require('jsonwebtoken');
const { formatError } = require('../utils/errorHandler');


// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res, req) => {
  // Merge guest cart if it exists
  if (req && req.visitorId) {
    const guestCart = await GuestCart.findOne({ visitorId: req.visitorId });
    if (guestCart && guestCart.cart && guestCart.cart.length > 0) {
      const userCartSet = new Set(user.cart.map(id => id.toString()));
      let merged = false;
      
      guestCart.cart.forEach(itemId => {
        if (!userCartSet.has(itemId.toString())) {
          user.cart.push(itemId);
          merged = true;
        }
      });
      
      if (merged) {
        await user.save();
      }
      
      // Delete the guest cart after merging
      await GuestCart.deleteOne({ _id: guestCart._id });
    }
  }

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

    await sendTokenResponse(user, 201, res, req);
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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

    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
  }
};

// @desc    Email-only login (Passwordless)
// @route   POST /api/auth/email-login
// @access  Public
exports.emailLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one with a dummy password and phone
    if (!user) {
      const dummyPassword = Math.random().toString(36).slice(-10) + 'A1!'; // random secure password
      const dummyPhone = '0000000000'; // dummy phone to satisfy schema

      user = await User.create({
        name: email.split('@')[0], // Use part of email as name
        email,
        password: dummyPassword,
        phone: dummyPhone,
        role: 'user'
      });
    }

    await sendTokenResponse(user, 200, res, req);
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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
    res.status(400).json({ success: false, error: formatError(err) });
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
    res.status(400).json({ success: false, error: formatError(err) });
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
    res.status(400).json({ success: false, error: formatError(err) });
  }
};
