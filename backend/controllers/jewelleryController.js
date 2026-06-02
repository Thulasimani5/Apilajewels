const Jewellery = require('../models/Jewellery');
const fs = require('fs');
const path = require('path');

const getAutoImages = (jewelId) => {
  if (!jewelId) return null;

  const uploadsPath = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) return null;

  try {
    let dirsToSearch = [];
    // Normalize IDs like AM010 to match folder naming (AM0010)
    let normalizedId = jewelId;
    if (/^[A-Z]{2}0[1-9]\d$/.test(jewelId)) {
      // Insert an extra zero after the prefix, e.g., AM010 -> AM0010
      normalizedId = `${jewelId.slice(0, 2)}0${jewelId.slice(2)}`;
    }
    const upperJewelId = normalizedId.toUpperCase();
    const originalUpper = jewelId.toUpperCase();
    
    if (upperJewelId.startsWith('AM') || originalUpper.startsWith('AM')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Mehandi'));
    } else if (upperJewelId.startsWith('AG') || originalUpper.startsWith('AG')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Gold'));
    } else if (upperJewelId.startsWith('AS') || originalUpper.startsWith('AS')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Silver'));
    } else if (upperJewelId.startsWith('MP') || originalUpper.startsWith('MP')) {
      dirsToSearch.push(path.join(uploadsPath, 'Mois Polki'));
    } else if (upperJewelId.startsWith('PB') || originalUpper.startsWith('PB')) {
      dirsToSearch.push(path.join(uploadsPath, 'Premium Gold Bridal Jewels'));
    }

    dirsToSearch = dirsToSearch.filter(dir => fs.existsSync(dir));

    if (dirsToSearch.length === 0) {
      const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
      // Get all subdirectories, and also the root uploads path
      dirsToSearch = [uploadsPath, ...items.filter(item => item.isDirectory()).map(dir => path.join(uploadsPath, dir.name))];
    }
    
    const escapedJewelId = upperJewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedOriginal = originalUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedJewelId === escapedOriginal ? escapedJewelId : `(${escapedJewelId}|${escapedOriginal})`;
    const regex = new RegExp(`^${regexPattern}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
    
    let allMatchedFiles = [];

    for (const dirPath of dirsToSearch) {
      try {
        const files = fs.readdirSync(dirPath);
        const matched = files.filter(file => regex.test(file));
        
        if (matched.length > 0) {
          const relativeDir = path.relative(uploadsPath, dirPath).replace(/\\/g, '/');
          matched.forEach(file => {
            allMatchedFiles.push({ file, relativeDir });
          });
        }
      } catch (e) {
        // ignore errors for unreadable dirs
      }
    }

    if (allMatchedFiles.length > 0) {
      allMatchedFiles.sort((aObj, bObj) => {
        const a = aObj.file;
        const b = bObj.file;
        
        const isBaseA = new RegExp(`^${regexPattern}\\.\\w+$`, 'i').test(a);
        const isBaseB = new RegExp(`^${regexPattern}\\.\\w+$`, 'i').test(b);
        
        if (isBaseA && !isBaseB) return -1;
        if (!isBaseA && isBaseB) return 1;
        
        const matchA = a.match(/\((\d+)\)/);
        const matchB = b.match(/\((\d+)\)/);
        
        const numA = matchA ? parseInt(matchA[1], 10) : 9999;
        const numB = matchB ? parseInt(matchB[1], 10) : 9999;
        
        if (numA !== numB) return numA - numB;
        
        return a.localeCompare(b);
      });
      
      return allMatchedFiles.map(obj => {
        const urlPath = obj.relativeDir ? `${obj.relativeDir}/${obj.file}` : obj.file;
        const url = encodeURI(`http://localhost:${process.env.PORT || 5000}/uploads/${urlPath}`);
        const type = obj.file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image';
        return { type, url };
      });
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
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

    const data = jewelleries.map(jewellery => {
      const doc = jewellery.toObject();
      const autoImages = getAutoImages(doc.jewelId);
      if (autoImages && autoImages.length > 0) {
        // Option to combine or override; overriding prioritizes folder structure
        doc.images = autoImages;
      }
      return doc;
    });

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
      count: data.length,
      pagination,
      data: data
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

    const data = jewellery.toObject();
    const autoImages = getAutoImages(data.jewelId);
    if (autoImages && autoImages.length > 0) {
      data.images = autoImages;
    }

    res.status(200).json({
      success: true,
      data: data
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

    const data = jewellery.toObject();
    const autoImages = getAutoImages(data.jewelId);
    if (autoImages && autoImages.length > 0) {
      data.images = autoImages;
    }

    res.status(201).json({
      success: true,
      data: data
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

    const data = jewellery.toObject();
    const autoImages = getAutoImages(data.jewelId);
    if (autoImages && autoImages.length > 0) {
      data.images = autoImages;
    }

    res.status(200).json({
      success: true,
      data: data
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
