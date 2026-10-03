const express = require('express');
const {
  getJewelleries,
  getJewellery,
  createJewellery,
  updateJewellery,
  patchJewelleryField,
  deleteJewellery
} = require('../controllers/jewelleryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { validateProductCreate } = require('../validators/productValidator');

const router = express.Router();

router.route('/')
  .get(getJewelleries)
  .post(protect, authorize('admin'), upload.array('images', 20), validateProductCreate, createJewellery);

router.route('/:id')
  .get(getJewellery)
  .put(protect, authorize('admin'), upload.array('images', 20), updateJewellery)
  .delete(protect, authorize('admin'), deleteJewellery);

router.patch('/:id/field', protect, authorize('admin'), patchJewelleryField);

module.exports = router;
