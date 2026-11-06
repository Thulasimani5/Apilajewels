const SaleJewellery = require('../models/SaleJewellery');
const ErrorResponse = require('../utils/errorHandler');

// @desc    Get all sale jewelleries
// @route   GET /api/sales
// @access  Public
exports.getSaleJewelleries = async (req, res, next) => {
  try {
    const { search, sort, page = 1, limit = 1000, all } = req.query;
    const filter = {};

    if (all !== 'true') {
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { jewelId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { colour: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc' || sort === 'price_low_high') {
      sortOption = { discountedRate: 1, salesPrice: 1 };
    } else if (sort === 'price_desc' || sort === 'price_high_low') {
      sortOption = { discountedRate: -1, salesPrice: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 1000;
    const skip = (pageNum - 1) * limitNum;

    const total = await SaleJewellery.countDocuments(filter);
    const data = await SaleJewellery.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server error while fetching sale jewellery'
    });
  }
};

// @desc    Get single sale jewellery
// @route   GET /api/sales/:id
// @access  Public
exports.getSaleJewellery = async (req, res, next) => {
  try {
    let item;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await SaleJewellery.findById(req.params.id);
    }
    if (!item) {
      item = await SaleJewellery.findOne({ jewelId: req.params.id.toUpperCase() });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Sale jewellery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Server error'
    });
  }
};

// @desc    Create new sale jewellery
// @route   POST /api/sales
// @access  Private/Admin
exports.createSaleJewellery = async (req, res, next) => {
  try {
    const {
      jewelId,
      name,
      purchaseAmount,
      salesPrice,
      discountPercent,
      discountedRate,
      colour,
      material,
      size,
      finish,
      description,
      stockCount
    } = req.body;

    if (!jewelId || !jewelId.trim()) {
      return res.status(400).json({ success: false, error: 'Jewel ID (Unique Code) is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Product name is required.' });
    }
    if (purchaseAmount === undefined || purchaseAmount === null || isNaN(parseFloat(purchaseAmount))) {
      return res.status(400).json({ success: false, error: 'Valid purchase amount is mandatory.' });
    }
    if (salesPrice === undefined || salesPrice === null || isNaN(parseFloat(salesPrice))) {
      return res.status(400).json({ success: false, error: 'Valid sales price is required.' });
    }
    if (!colour || !colour.trim()) {
      return res.status(400).json({ success: false, error: 'Colour is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Description is required.' });
    }

    const normId = jewelId.trim().toUpperCase();
    const existing = await SaleJewellery.findOne({ jewelId: normId });
    if (existing) {
      return res.status(400).json({ success: false, error: `Jewel ID "${normId}" already exists.` });
    }

    // Process uploaded images
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
          const parsed = JSON.parse(req.body.images);
          if (Array.isArray(parsed)) images = [...images, ...parsed];
        } catch (e) {}
      } else if (Array.isArray(req.body.images)) {
        images = [...images, ...req.body.images];
      }
    }

    const pAmt = parseFloat(purchaseAmount);
    const sPrice = parseFloat(salesPrice);
    const dPct = parseFloat(discountPercent) || 0;
    const dRate = discountedRate !== undefined && !isNaN(parseFloat(discountedRate))
      ? parseFloat(discountedRate)
      : Math.max(0, sPrice - (sPrice * dPct) / 100);

    const saleJewel = await SaleJewellery.create({
      jewelId: normId,
      name: name.trim(),
      purchaseAmount: pAmt,
      salesPrice: sPrice,
      discountPercent: dPct,
      discountedRate: dRate,
      colour: colour.trim(),
      material: material ? material.trim() : '',
      size: size ? size.trim() : '',
      finish: finish ? finish.trim() : '',
      description: description.trim(),
      stockCount: stockCount !== undefined && !isNaN(parseInt(stockCount, 10)) ? parseInt(stockCount, 10) : 1,
      images,
      isSale: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: saleJewel
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to create sale jewellery item'
    });
  }
};

// @desc    Update sale jewellery
// @route   PUT /api/sales/:id
// @access  Private/Admin
exports.updateSaleJewellery = async (req, res, next) => {
  try {
    let item = await SaleJewellery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Sale jewellery item not found' });
    }

    let images = item.images || [];

    // Remove deleted images
    if (req.body.removedImages) {
      try {
        const removed = typeof req.body.removedImages === 'string'
          ? JSON.parse(req.body.removedImages)
          : req.body.removedImages;
        if (Array.isArray(removed)) {
          images = images.filter(img => !removed.includes(img.url));
        }
      } catch (e) {}
    }

    // Append new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        const url = file.path;
        const type = file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image';
        return { type, url };
      });
      images = [...images, ...newImages];
    }

    req.body.images = images;

    if (req.body.jewelId) {
      req.body.jewelId = req.body.jewelId.trim().toUpperCase();
      const duplicate = await SaleJewellery.findOne({
        jewelId: req.body.jewelId,
        _id: { $ne: item._id }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, error: `Jewel ID "${req.body.jewelId}" already belongs to another item.` });
      }
    }

    if (req.body.purchaseAmount !== undefined) req.body.purchaseAmount = parseFloat(req.body.purchaseAmount);
    if (req.body.salesPrice !== undefined) req.body.salesPrice = parseFloat(req.body.salesPrice);
    if (req.body.discountPercent !== undefined) req.body.discountPercent = parseFloat(req.body.discountPercent) || 0;
    if (req.body.discountedRate !== undefined) req.body.discountedRate = parseFloat(req.body.discountedRate);
    if (req.body.stockCount !== undefined) req.body.stockCount = parseInt(req.body.stockCount, 10) || 0;
    if (req.body.isSale !== undefined) req.body.isSale = req.body.isSale === true || req.body.isSale === 'true';
    if (req.body.isActive !== undefined) req.body.isActive = req.body.isActive === true || req.body.isActive === 'true';

    item = await SaleJewellery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to update sale jewellery item'
    });
  }
};

// @desc    Delete sale jewellery
// @route   DELETE /api/sales/:id
// @access  Private/Admin
exports.deleteSaleJewellery = async (req, res, next) => {
  try {
    const item = await SaleJewellery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Sale jewellery item not found' });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete sale jewellery item'
    });
  }
};

// @desc    Patch single field on sale jewellery
// @route   PATCH /api/sales/:id/field
// @access  Private/Admin
exports.patchSaleJewelleryField = async (req, res, next) => {
  try {
    const { fieldName, value } = req.body;
    if (!fieldName) {
      return res.status(400).json({ success: false, error: 'Field name is required' });
    }

    const item = await SaleJewellery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Sale jewellery item not found' });
    }

    item[fieldName] = value;
    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Failed to patch field'
    });
  }
};

