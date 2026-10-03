const auditLogRepository = require('../repositories/auditLogRepository');

class AuditLogService {
  async logAction({ adminId, adminEmail, action, entity, entityId, oldValue, newValue }) {
    try {
      await auditLogRepository.createLog({
        adminId: adminId || undefined,
        adminEmail: adminEmail || 'admin',
        action,
        entity,
        entityId: entityId ? entityId.toString() : 'N/A',
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null
      });
    } catch (err) {
      console.error('Failed to record admin audit log:', err);
    }
  }

  async getLogs(options) {
    return await auditLogRepository.findLogs(options);
  }
}

module.exports = new AuditLogService();
