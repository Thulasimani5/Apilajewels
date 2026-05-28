const express = require('express');
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), upload.single('image'), addCategory);

router
  .route('/:id')
  .put(protect, authorize('admin'), upload.single('image'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
