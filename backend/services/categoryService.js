const categoryRepository = require('../repositories/categoryRepository');
const jewelleryRepository = require('../repositories/jewelleryRepository');
const auditLogService = require('./auditLogService');
const ErrorResponse = require('../utils/errorHandler');

class CategoryService {
  async getCategories() {
    let categories = await categoryRepository.findAll();

    // Auto-seed default categories if empty
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Victorian Moissanite Sets', image: 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80', subtext: 'Victorian Moissanite', showInSection: 'category' },
        { name: 'Bridal Combos', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', subtext: 'Grand Bridal Collections', showInSection: 'category' },
        { name: 'Semi Bridal & Choker Sets', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', subtext: 'Chokers & Neckpieces', showInSection: 'category' },
        { name: 'Long Harams', image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80', subtext: 'Long Necklaces', showInSection: 'category' },
        { name: 'Bangles & Bracelets', image: 'https://images.unsplash.com/photo-1611591475777-233ca732222e?w=800&q=80', subtext: 'Bangles Collection', showInSection: 'category' },
        { name: 'Accessories', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', subtext: 'Earrings & Tikka', showInSection: 'category' }
      ];

      for (const cat of defaultCategories) {
        await categoryRepository.create(cat);
      }
      categories = await categoryRepository.findAll();
    }

    // Attach count of jewelleries per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const jewelCount = await jewelleryRepository.countByCategory(c.name);
        return {
          ...c.toObject(),
          jewelCount
        };
      })
    );

    return categoriesWithCount;
  }

  async createCategory(data, adminUser = null) {
    if (!data.name) {
      throw new ErrorResponse('Please provide a category name', 400);
    }
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new ErrorResponse(`Category with name '${data.name}' already exists`, 400);
    }

    const category = await categoryRepository.create(data);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: category._id.toString(),
        newValue: category.toObject()
      });
    }

    return category;
  }

  async updateCategory(id, data, adminUser = null) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Category not found', 404);
    }

    const oldValue = existing.toObject();
    const updated = await categoryRepository.update(id, data);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'UPDATE_CATEGORY',
        entity: 'Category',
        entityId: id,
        oldValue,
        newValue: updated.toObject()
      });
    }

    return updated;
  }

  async deleteCategory(id, adminUser = null) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Category not found', 404);
    }

    const oldValue = existing.toObject();
    await categoryRepository.delete(id);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'DELETE_CATEGORY',
        entity: 'Category',
        entityId: id,
        oldValue
      });
    }

    return true;
  }
}

module.exports = new CategoryService();
