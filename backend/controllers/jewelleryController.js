const Jewellery = require('../models/Jewellery');

// @desc    Get all jewellery
// @route   GET /api/jewellery
// @access  Public
exports.getJewelleries = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from the base filter
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create base filter (convert gt/gte/lt/lte/in operators)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    const baseFilter = JSON.parse(queryStr);

    // Build final filter — merge base filter with $or search if provided
    let finalFilter = { ...baseFilter };
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      finalFilter = {
        ...baseFilter,
        $or: [
          { name: searchRegex },
          { jewelId: searchRegex },
          { category: searchRegex },
          { type: searchRegex },
          { colour: searchRegex },
          { material: searchRegex },
          { finish: searchRegex },
          { description: searchRegex },
          { occasion: searchRegex },
          { stones: searchRegex }
        ]
      };
    }

    let query = Jewellery.find(finalFilter);

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
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        const normalizedPath = file.path.replace(/\\/g, '/');
        const url = `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
        const type = file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image';
        return { type, url };
      });
    }

    if (req.body.images) {
      if (typeof req.body.images === 'string') {
        try {
          req.body.images = JSON.parse(req.body.images);
        } catch (e) {}
      }
      if (Array.isArray(req.body.images)) {
        images = [...images, ...req.body.images];
      }
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

    let images = jewellery.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const normalizedPath = file.path.replace(/\\/g, '/');
        const url = `http://localhost:${process.env.PORT || 5000}/${normalizedPath}`;
        const type = file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image';
        return { type, url };
      });
      images = [...images, ...newImages];
    }

    if (req.body.images) {
      if (typeof req.body.images === 'string') {
        try {
          req.body.images = JSON.parse(req.body.images);
        } catch (e) {}
      }
      if (Array.isArray(req.body.images)) {
        images = [...images, ...req.body.images];
      }
    }

    req.body.images = images;

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
