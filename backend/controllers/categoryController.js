const categoryService = require('../services/categoryService');
const { formatError } = require('../utils/errorHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Add category
// @route   POST /api/categories
// @access  Private/Admin
exports.addCategory = async (req, res, next) => {
  try {
    const { name, subtext, showInSection } = req.body;
    let image = null;
    if (req.file) {
      image = req.file.path;
    }

    const category = await categoryService.createCategory(
      {
        name,
        image,
        subtext: subtext ? subtext.trim() : '',
        showInSection: showInSection || 'category'
      },
      req.user
    );

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, subtext, showInSection } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (subtext !== undefined) updateData.subtext = subtext;
    if (showInSection) updateData.showInSection = showInSection;
    if (req.file) updateData.image = req.file.path;

    const category = await categoryService.updateCategory(req.params.id, updateData, req.user);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};
