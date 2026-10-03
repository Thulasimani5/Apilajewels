const express = require('express');
const { getPaymentSummary, recordPayment, createOrder } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/booking/:bookingId', protect, getPaymentSummary);
router.post('/record', protect, authorize('admin'), recordPayment);
router.post('/create-order', protect, createOrder);

module.exports = router;
