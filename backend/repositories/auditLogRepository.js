const AdminAuditLog = require('../models/AdminAuditLog');

class AuditLogRepository {
  async createLog(logData) {
    return await AdminAuditLog.create(logData);
  }

  async findLogs(options = {}) {
    const { limit = 100, page = 1 } = options;
    const skip = (page - 1) * limit;
    return await AdminAuditLog.find({})
      .populate('adminId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new AuditLogRepository();
