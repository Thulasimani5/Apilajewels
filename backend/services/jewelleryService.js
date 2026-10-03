const jewelleryRepository = require('../repositories/jewelleryRepository');
const auditLogService = require('./auditLogService');
const ErrorResponse = require('../utils/errorHandler');

class JewelleryService {
  async getJewelleries(query = {}) {
    const { category, type, occasion, stoneName, search, page = 1, limit = 1000 } = query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (type) {
      filter.type = type;
    }
    if (occasion) {
      filter.occasion = occasion;
    }
    if (stoneName) {
      filter.stoneName = stoneName;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { jewelId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    return await jewelleryRepository.findWithQuery(filter, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    });
  }

  async getJewelleryById(id) {
    const jewellery = await jewelleryRepository.findById(id);
    if (!jewellery) {
      throw new ErrorResponse('Jewellery not found', 404);
    }
    await jewelleryRepository.incrementPopularity(id);
    return jewellery;
  }

  async createJewellery(data, adminUser = null) {
    const existing = await jewelleryRepository.findByJewelId(data.jewelId);
    if (existing) {
      throw new ErrorResponse(`Jewellery with ID ${data.jewelId} already exists`, 400);
    }

    const item = await jewelleryRepository.create(data);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'CREATE_PRODUCT',
        entity: 'Jewellery',
        entityId: item._id.toString(),
        newValue: item.toObject()
      });
    }

    return item;
  }

  async updateJewellery(id, data, adminUser = null) {
    const existing = await jewelleryRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Jewellery not found', 404);
    }

    const oldValue = existing.toObject();
    const updated = await jewelleryRepository.update(id, data);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'UPDATE_PRODUCT',
        entity: 'Jewellery',
        entityId: id,
        oldValue,
        newValue: updated.toObject()
      });
    }

    return updated;
  }

  async patchJewelleryField(id, fieldName, value, adminUser = null) {
    const existing = await jewelleryRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Jewellery not found', 404);
    }

    const oldValue = { [fieldName]: existing[fieldName] };
    existing[fieldName] = value;
    await existing.save();

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'PATCH_PRODUCT_FIELD',
        entity: 'Jewellery',
        entityId: id,
        oldValue,
        newValue: { [fieldName]: value }
      });
    }

    return existing;
  }

  async deleteJewellery(id, adminUser = null) {
    const existing = await jewelleryRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Jewellery not found', 404);
    }

    const oldValue = existing.toObject();
    await jewelleryRepository.delete(id);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'DELETE_PRODUCT',
        entity: 'Jewellery',
        entityId: id,
        oldValue
      });
    }

    return true;
  }
}

module.exports = new JewelleryService();
