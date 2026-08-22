const express = require('express');
const { getCart, syncCart, getAllGuestCarts } = require('../controllers/cartController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const visitorMiddleware = require('../middleware/visitor');

const router = express.Router();

router.use(visitorMiddleware);

router.get('/all-guests', protect, authorize('admin'), getAllGuestCarts);

router.use(optionalAuth);

router.route('/')
  .get(getCart)
  .put(syncCart);

module.exports = router;
