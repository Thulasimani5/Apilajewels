const express = require('express');
const {
  getSaleJewelleries,
  getSaleJewellery,
  createSaleJewellery,
  updateSaleJewellery,
  deleteSaleJewellery,
  patchSaleJewelleryField
} = require('../controllers/saleJewelleryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getSaleJewelleries)
  .post(protect, authorize('admin'), upload.array('images', 20), createSaleJewellery);

router.route('/:id')
  .get(getSaleJewellery)
  .put(protect, authorize('admin'), upload.array('images', 20), updateSaleJewellery)
  .delete(protect, authorize('admin'), deleteSaleJewellery);

router.patch('/:id/field', protect, authorize('admin'), patchSaleJewelleryField);

module.exports = router;

