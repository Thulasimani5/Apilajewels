const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add category
// @route   POST /api/categories
// @access  Private/Admin
exports.addCategory = async (req, res) => {
  try {
    const { name, subtext } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a category name' });
    }
    if (!subtext || !subtext.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a category subtext' });
    }

    let image = null;
    if (req.file) {
      const normalizedPath = req.file.path.replace(/\\/g, '/');
      image = `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
    }

    const category = await Category.create({ name, image, subtext: subtext.trim() });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, subtext } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (subtext !== undefined) updateData.subtext = subtext;

    if (req.file) {
      const normalizedPath = req.file.path.replace(/\\/g, '/');
      updateData.image = `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Category name already exists' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'No category found' });
    }

    await category.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
