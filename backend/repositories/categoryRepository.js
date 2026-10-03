const Category = require('../models/Category');

class CategoryRepository {
  async findAll() {
    return await Category.find({}).sort('name');
  }

  async findById(id) {
    return await Category.findById(id);
  }

  async findByName(name) {
    return await Category.findOne({ name });
  }

  async create(data) {
    return await Category.create(data);
  }

  async update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  async count() {
    return await Category.countDocuments({});
  }
}

module.exports = new CategoryRepository();
