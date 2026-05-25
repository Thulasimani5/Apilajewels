const Jewellery = require('../models/Jewellery');

// @desc    Get all jewellery
// @route   GET /api/jewellery
// @access  Public
exports.getJewelleries = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Jewellery.find(JSON.parse(queryStr));

    // Search by name or code
    if (req.query.search) {
      query = query.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { code: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Jewellery.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jewelleries = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: jewelleries.length,
      pagination,
      data: jewelleries
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single jewellery
// @route   GET /api/jewellery/:id
// @access  Public
exports.getJewellery = async (req, res) => {
  try {
    const jewellery = await Jewellery.findById(req.params.id);

    if (!jewellery) {
      return res.status(404).json({ success: false, error: 'Jewellery not found' });
    }

    res.status(200).json({
      success: true,
      data: jewellery
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new jewellery
// @route   POST /api/jewellery
// @access  Private/Admin
exports.createJewellery = async (req, res) => {
  try {
    // Add user to req.body if we want to track who created it, not needed here
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        const normalizedPath = file.path.replace(/\\/g, '/');
        return `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
      });
    }
    
    req.body.images = images;

    const jewellery = await Jewellery.create(req.body);

    res.status(201).json({
      success: true,
      data: jewellery
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update jewellery
// @route   PUT /api/jewellery/:id
// @access  Private/Admin
exports.updateJewellery = async (req, res) => {
  try {
    let jewellery = await Jewellery.findById(req.params.id);

    if (!jewellery) {
      return res.status(404).json({ success: false, error: 'Jewellery not found' });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const normalizedPath = file.path.replace(/\\/g, '/');
        return `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
      });
      req.body.images = [...jewellery.images, ...newImages];
    }

    jewellery = await Jewellery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: jewellery
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete jewellery
// @route   DELETE /api/jewellery/:id
// @access  Private/Admin
exports.deleteJewellery = async (req, res) => {
  try {
    const jewellery = await Jewellery.findById(req.params.id);

    if (!jewellery) {
      return res.status(404).json({ success: false, error: 'Jewellery not found' });
    }

    await jewellery.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
