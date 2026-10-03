const Jewellery = require('../models/Jewellery');

class JewelleryRepository {
  async findById(id) {
    return await Jewellery.findById(id);
  }

  async findByJewelId(jewelId) {
    return await Jewellery.findOne({ jewelId });
  }

  async findWithQuery(filter, options = {}) {
    const { page = 1, limit = 1000, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Jewellery.find(filter).sort(sort).skip(skip).limit(limit),
      Jewellery.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(data) {
    return await Jewellery.create(data);
  }

  async update(id, data) {
    return await Jewellery.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Jewellery.findByIdAndDelete(id);
  }

  async incrementPopularity(id) {
    return await Jewellery.findByIdAndUpdate(id, { $inc: { popularity: 1 } }, { new: true });
  }

  async countByCategory(categoryName) {
    return await Jewellery.countDocuments({
      $or: [
        { category: categoryName },
        { type: categoryName }
      ]
    });
  }
}

module.exports = new JewelleryRepository();
