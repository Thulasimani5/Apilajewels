const Jewellery = require('../models/Jewellery');
const jewelleryRepository = require('../repositories/jewelleryRepository');
const auditLogService = require('./auditLogService');
const ErrorResponse = require('../utils/errorHandler');

class JewelleryService {
  async getJewelleries(query = {}) {
    const { category, type, accessoryType, occasion, stoneName, search, isSale, page = 1, limit = 1000, sort } = query;
    const filter = {};

    if (isSale !== undefined) {
      filter.isSale = isSale === 'true' || isSale === true;
    }

    if (category) {
      const escapedCat = category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: new RegExp(`^${escapedCat}$`, 'i') };
    }
    if (type) {
      const escapedType = type.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.type = { $regex: new RegExp(`^${escapedType}$`, 'i') };
    }
    if (accessoryType) {
      const escapedAcc = accessoryType.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.accessoryType = { $regex: new RegExp(`^${escapedAcc}$`, 'i') };
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

    let sortOption = { sortOrder: 1, _id: 1 };
    if (sort) {
      if (typeof sort === 'string') {
        const parts = sort.split(',');
        sortOption = {};
        parts.forEach(p => {
          const trimmed = p.trim();
          if (trimmed.startsWith('-')) {
            sortOption[trimmed.substring(1)] = -1;
          } else {
            sortOption[trimmed] = 1;
          }
        });
      } else {
        sortOption = sort;
      }
    }

    return await jewelleryRepository.findWithQuery(filter, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOption
    });
  }

  async getJewelleryById(id) {
    let jewellery = await jewelleryRepository.findById(id);
    if (!jewellery) {
      try {
        const SaleJewellery = require('../models/SaleJewellery');
        jewellery = await SaleJewellery.findById(id);
        if (jewellery) {
          const obj = jewellery.toObject();
          obj.salesAmount = jewellery.discountedRate || jewellery.salesPrice;
          obj.rentalPrice = jewellery.discountedRate || jewellery.salesPrice;
          obj.price = jewellery.discountedRate || jewellery.salesPrice;
          return obj;
        }
      } catch (e) {
        // ignore and let next check handle
      }
    }
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

    // If sortOrder is not explicitly specified, shuffle this new item into a random slot
    // so it doesn't end up at the very last page, and the catalog order remains static
    if (data.sortOrder === undefined || data.sortOrder === null || data.sortOrder === '') {
      const totalCount = await jewelleryRepository.countAll();
      if (totalCount > 0) {
        // Pick a random position between 1 and totalCount + 1
        const randomSlot = Math.floor(Math.random() * (totalCount + 1)) + 1;
        // Shift existing items at or after this slot by 1
        await Jewellery.updateMany(
          { sortOrder: { $gte: randomSlot } },
          { $inc: { sortOrder: 1 } }
        );
        data.sortOrder = randomSlot;
      } else {
        data.sortOrder = 1;
      }
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

  async reshuffleCatalog(adminUser = null) {
    const items = await Jewellery.find({}).select('_id');
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const bulkOps = shuffled.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { sortOrder: index + 1 } }
      }
    }));

    if (bulkOps.length > 0) {
      await Jewellery.bulkWrite(bulkOps);
    }

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'RESHUFFLE_CATALOG',
        entity: 'Jewellery',
        entityId: 'all',
        newValue: { totalShuffled: bulkOps.length }
      });
    }

    return { success: true, count: bulkOps.length };
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
