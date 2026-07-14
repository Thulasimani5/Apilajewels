const Jewellery = require('../models/Jewellery');
const { cloudinary } = require('../config/cloudinary');
const { formatError } = require('../utils/errorHandler');


// Cache for Cloudinary search results to avoid hitting rate limits and slowing requests
const autoImagesCache = new Map();

// Auto-assign images from Cloudinary by searching for files matching the jewelId
const getAutoImages = async (jewelId) => {
  if (!jewelId) return null;
  // Only run if Cloudinary is properly configured
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;

  if (autoImagesCache.has(jewelId)) {
    return autoImagesCache.get(jewelId);
  }

  try {
    // Normalize IDs like AM010 -> AM0010
    let normalizedId = jewelId;
    if (/^[A-Z]{2}0[1-9]\d$/.test(jewelId)) {
      normalizedId = `${jewelId.slice(0, 2)}0${jewelId.slice(2)}`;
    }
    const upperJewelId = normalizedId.toUpperCase();
    const originalUpper = jewelId.toUpperCase();

    // Build expression to search Cloudinary for files whose filename starts with the jewelId
    const expression = `folder:apila_jewels/* AND (public_id:*/${upperJewelId}* OR public_id:*/${originalUpper}*)`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('public_id', 'asc')
      .max_results(30)
      .execute();

    if (result && result.resources && result.resources.length > 0) {
      const images = result.resources.map(resource => ({
        type: resource.resource_type === 'video' ? 'video' : 'image',
        url: resource.secure_url
      }));
      autoImagesCache.set(jewelId, images);
      return images;
    }
  } catch (error) {
    console.error('Cloudinary auto-image search error:', error.message);
  }
  // Cache null/empty results as well to prevent repeated hits for non-existent IDs
  autoImagesCache.set(jewelId, null);
  return null;
};


// @desc    Get all jewellery
// @route   GET /api/jewellery
// @access  Public
exports.getJewelleries = async (req, res) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from the base filter
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'random'];
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

    const isRandom = req.query.random === 'true';
    const limit = parseInt(req.query.limit, 10) || 10;

    let jewelleries;
    if (isRandom) {
      jewelleries = await Jewellery.aggregate([
        { $match: finalFilter },
        { $sample: { size: limit } }
      ]);
    } else {
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
      const startIndex = (page - 1) * limit;
      query = query.skip(startIndex).limit(limit);

      // Executing query
      jewelleries = await query;
    }

    const total = await Jewellery.countDocuments(JSON.parse(queryStr));

    const data = await Promise.all(jewelleries.map(async jewellery => {
      const doc = jewellery.toObject ? jewellery.toObject() : jewellery;
      // Populate virtuals for compatibility (if object is from aggregation)
      if (doc.rentalPrice === undefined && doc.price !== undefined) {
        doc.rentalPrice = doc.price;
      }
      if (doc.code === undefined && doc.jewelId !== undefined) {
        doc.code = doc.jewelId;
      }
      if (doc.id === undefined && doc._id !== undefined) {
        doc.id = doc._id.toString();
      }
      if (!doc.images || doc.images.length === 0) {
        const autoImages = await getAutoImages(doc.jewelId);
        if (autoImages && autoImages.length > 0) {
          doc.images = autoImages;
        }
      }
      return doc;
    }));

    // Pagination result
    const pagination = {};
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

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
      count: data.length,
      pagination,
      data: data
    });
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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

    const data = jewellery.toObject();
    if (!data.images || data.images.length === 0) {
      const autoImages = await getAutoImages(data.jewelId);
      if (autoImages && autoImages.length > 0) {
        data.images = autoImages;
      }
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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

    const jewellery = await Jewellery.create(req.body);

    const data = jewellery.toObject();
    if (!data.images || data.images.length === 0) {
      const autoImages = await getAutoImages(data.jewelId);
      if (autoImages && autoImages.length > 0) {
        data.images = autoImages;
      }
    }

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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
    
    // Check if frontend provided a strict reordered list
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
        }).filter(Boolean); // Filter out any undefined just in case
      } catch (e) {
        console.error("Error parsing reorderedImages", e);
      }
    } else {
      // Legacy behavior if reorderedImages is not sent
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => {
          const url = file.path;
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
    }

    req.body.images = images;

    jewellery = await Jewellery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const data = jewellery.toObject();
    if (!data.images || data.images.length === 0) {
      const autoImages = await getAutoImages(data.jewelId);
      if (autoImages && autoImages.length > 0) {
        data.images = autoImages;
      }
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(400).json({ success: false, error: formatError(err) });
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
    res.status(400).json({ success: false, error: formatError(err) });
  }
};
