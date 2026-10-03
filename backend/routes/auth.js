const express = require('express');
const { register, login, emailLogin, getMe, getUsers, updateCart } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { validateRegisterInput, validateLoginInput } = require('../validators/authValidator');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

router.post('/register', authLimiter, validateRegisterInput, register);
router.post('/login', authLimiter, validateLoginInput, login);
router.post('/email-login', authLimiter, emailLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/cart', protect, updateCart);

module.exports = router;
