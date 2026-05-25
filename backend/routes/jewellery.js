const express = require('express');
const {
  getJewelleries,
  getJewellery,
  createJewellery,
  updateJewellery,
  deleteJewellery
} = require('../controllers/jewelleryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getJewelleries)
  .post(protect, authorize('admin'), upload.array('images', 5), createJewellery);

router.route('/:id')
  .get(getJewellery)
  .put(protect, authorize('admin'), upload.array('images', 5), updateJewellery)
  .delete(protect, authorize('admin'), deleteJewellery);

module.exports = router;
