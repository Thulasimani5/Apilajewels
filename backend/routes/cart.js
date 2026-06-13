const express = require('express');
const { getCart, syncCart } = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');
const visitorMiddleware = require('../middleware/visitor');

const router = express.Router();

router.use(visitorMiddleware);
router.use(optionalAuth);

router.route('/')
  .get(getCart)
  .put(syncCart);

module.exports = router;
