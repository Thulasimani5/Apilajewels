const Category = require('../models/Category');

const Jewellery = require('../models/Jewellery');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
      const field = cat.showInSection === 'type' ? 'type' : 'category';
      const count = await Jewellery.countDocuments({ [field]: cat.name });
      return { ...cat.toObject(), jewelCount: count };
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
      stack: error.stack
    });
  }
};

// @desc    Add category
// @route   POST /api/categories
// @access  Private/Admin
exports.addCategory = async (req, res) => {
  try {
    const { name, subtext, showInSection } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a category name' });
    }

    let image = null;
    if (req.file) {
      image = req.file.path;
    }

    const category = await Category.create({ 
      name, 
      image, 
      subtext: subtext ? subtext.trim() : '',
      showInSection: showInSection || 'category'
    });

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
    const { name, subtext, showInSection } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (subtext !== undefined) updateData.subtext = subtext;
    if (showInSection) updateData.showInSection = showInSection;

    if (req.file) {
      updateData.image = req.file.path;
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
