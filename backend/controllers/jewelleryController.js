const jewelleryService = require('../services/jewelleryService');
const { formatError } = require('../utils/errorHandler');

// @desc    Get all jewellery with pagination and filter support
// @route   GET /api/jewellery
// @access  Public
exports.getJewelleries = async (req, res, next) => {
  try {
    const result = await jewelleryService.getJewelleries(req.query);
    res.status(200).json({
      success: true,
      count: result.items.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      data: result.items
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Get single jewellery
// @route   GET /api/jewellery/:id
// @access  Public
exports.getJewellery = async (req, res, next) => {
  try {
    const jewellery = await jewelleryService.getJewelleryById(req.params.id);
    res.status(200).json({
      success: true,
      data: jewellery
    });
  } catch (err) {
    res.status(err.statusCode || 404).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Create new jewellery
// @route   POST /api/jewellery
// @access  Private/Admin
exports.createJewellery = async (req, res, next) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        const url = file.path;
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
    if (!req.body.accessoryType || req.body.accessoryType === '' || req.body.accessoryType === 'null') {
      req.body.accessoryType = null;
    }

    const jewellery = await jewelleryService.createJewellery(req.body, req.user);
    res.status(201).json({
      success: true,
      data: jewellery
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Update jewellery
// @route   PUT /api/jewellery/:id
// @access  Private/Admin
exports.updateJewellery = async (req, res, next) => {
  try {
    const existing = await jewelleryService.getJewelleryById(req.params.id);
    let images = existing.images || [];

    if (req.body.reorderedImages) {
      try {
        const reordered = JSON.parse(req.body.reorderedImages);
        let newFileIndex = 0;
        const newImages = req.files ? req.files.map(file => {
          const url = file.path;
          const type = file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image';
          return { type, url };
        }) : [];

        images = reordered.map(item => {
          if (item.isNew) {
            return newImages[newFileIndex++];
          }
          return { type: item.type, url: item.url };
        }).filter(Boolean);
      } catch (e) {
        console.error('Error parsing reorderedImages:', e);
      }
    } else if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const url = file.path;
        const type = file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image';
        return { type, url };
      });
      images = [...images, ...newImages];
    }

    req.body.images = images;
    if (!req.body.accessoryType || req.body.accessoryType === '' || req.body.accessoryType === 'null') {
      req.body.accessoryType = null;
    }

    const updated = await jewelleryService.updateJewellery(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Patch single field on jewellery
// @route   PATCH /api/jewellery/:id/field
// @access  Private/Admin
exports.patchJewelleryField = async (req, res, next) => {
  try {
    const { fieldName, value } = req.body;
    const updated = await jewelleryService.patchJewelleryField(req.params.id, fieldName, value, req.user);
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};

// @desc    Delete jewellery
// @route   DELETE /api/jewellery/:id
// @access  Private/Admin
exports.deleteJewellery = async (req, res, next) => {
  try {
    await jewelleryService.deleteJewellery(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message || formatError(err) });
  }
};
