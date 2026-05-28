const express = require('express');
const { register, login, getMe, getUsers, updateCart } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/cart', protect, updateCart);

module.exports = router;
