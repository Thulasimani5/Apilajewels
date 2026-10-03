const bookingRepository = require('../repositories/bookingRepository');
const jewelleryRepository = require('../repositories/jewelleryRepository');
const auditLogService = require('./auditLogService');
const ErrorResponse = require('../utils/errorHandler');

class BookingService {
  validateBookingDates(pickupDate, eventDate, returnDate) {
    if (pickupDate && eventDate) {
      const pDate = new Date(pickupDate);
      const eDate = new Date(eventDate);
      if (pDate > eDate) {
        throw new ErrorResponse('Pickup date must be on or before event date', 400);
      }
    }
    if (eventDate && returnDate) {
      const eDate = new Date(eventDate);
      const rDate = new Date(returnDate);
      if (eDate > rDate) {
        throw new ErrorResponse('Event date must be on or before return date', 400);
      }
    }
    if (pickupDate && returnDate) {
      const pDate = new Date(pickupDate);
      const rDate = new Date(returnDate);
      if (pDate > rDate) {
        throw new ErrorResponse('Pickup date must be on or before return date', 400);
      }
    }
  }

  async checkDateConflicts(jewelleryIds, pickupDate, returnDate, excludeBookingId = null) {
    if (!jewelleryIds || !jewelleryIds.length || !pickupDate || !returnDate) {
      return;
    }

    const conflicts = await bookingRepository.findOverlappingBookings(
      jewelleryIds,
      pickupDate,
      returnDate,
      excludeBookingId
    );

    if (conflicts && conflicts.length > 0) {
      const conflictingItemNames = conflicts.flatMap(b => b.jewelleryIds ? b.jewelleryIds.map(j => j.name || j.jewelId) : []).join(', ');
      throw new ErrorResponse(
        `Selected jewellery (${conflictingItemNames}) is already reserved for an active booking during the selected dates (${new Date(pickupDate).toLocaleDateString()} - ${new Date(returnDate).toLocaleDateString()}).`,
        400
      );
    }
  }

  validateStatusTransition(currentStatus, newStatus) {
    if (!currentStatus || !newStatus || currentStatus === newStatus) return;

    const allowedTransitions = {
      pending: ['approved', 'confirmed', 'rejected'],
      approved: ['confirmed', 'inevent', 'rejected'],
      confirmed: ['inevent', 'rejected'],
      inevent: ['completed'],
      completed: [],
      rejected: ['pending']
    };

    const allowed = allowedTransitions[currentStatus.toLowerCase()];
    if (allowed && !allowed.includes(newStatus.toLowerCase())) {
      throw new ErrorResponse(`Invalid status transition from '${currentStatus}' to '${newStatus}'`, 400);
    }
  }

  async createBooking(bookingData, user = null, visitorId = null) {
    const { pickupDate, eventDate, returnDate, jewelleryIds = [], tempJewelleries = [] } = bookingData;

    this.validateBookingDates(pickupDate, eventDate, returnDate);

    if (jewelleryIds.length > 0 && pickupDate && returnDate) {
      await this.checkDateConflicts(jewelleryIds, pickupDate, returnDate);
    }

    // Financial calculations
    let calculatedRentalAmount = bookingData.rentalAmount || 0;
    if (!calculatedRentalAmount && jewelleryIds.length > 0) {
      for (const jId of jewelleryIds) {
        const jewel = await jewelleryRepository.findById(jId);
        if (jewel) {
          calculatedRentalAmount += (jewel.rentalPrice || jewel.price || 0);
        }
      }
      for (const temp of tempJewelleries) {
        calculatedRentalAmount += (parseFloat(temp.rentalPrice) || 0);
      }
    }

    const dPercent = parseFloat(bookingData.discountPercent) || 0;
    const dAmountInput = parseFloat(bookingData.discountAmount) || 0;
    const discountAmount = dAmountInput > 0 ? dAmountInput : (calculatedRentalAmount * dPercent) / 100;
    const totalAmount = bookingData.totalAmount !== undefined
      ? bookingData.totalAmount
      : Math.max(0, calculatedRentalAmount - discountAmount);

    const advancePaid = parseFloat(bookingData.advancePaid) || 0;
    const balanceAmount = Math.max(0, totalAmount - advancePaid);

    const payload = {
      ...bookingData,
      userId: user ? user._id : bookingData.userId || undefined,
      visitorId: visitorId || bookingData.visitorId || undefined,
      rentalAmount: calculatedRentalAmount,
      discountPercent: dPercent,
      discountAmount,
      totalAmount,
      advancePaid,
      balanceAmount,
      status: bookingData.status || 'pending',
      paymentStatus: bookingData.paymentStatus || (advancePaid >= totalAmount && totalAmount > 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending')
    };

    const booking = await bookingRepository.create(payload);

    if (user && user.role === 'admin') {
      await auditLogService.logAction({
        adminId: user._id,
        adminEmail: user.email || user.phone,
        action: 'CREATE_BOOKING',
        entity: 'Booking',
        entityId: booking._id.toString(),
        newValue: booking.toObject()
      });
    }

    return booking;
  }

  async getAllBookings() {
    return await bookingRepository.findAll();
  }

  async getUserBookings(userId) {
    return await bookingRepository.findByUser(userId);
  }

  async getBookingById(id) {
    let booking = await bookingRepository.findById(id);
    if (!booking) {
      booking = await bookingRepository.findByCustomId(id);
    }
    if (!booking) {
      throw new ErrorResponse('Booking not found', 404);
    }
    return booking;
  }

  async updateBooking(id, bookingData, adminUser = null) {
    const existing = await bookingRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Booking not found', 404);
    }

    const pickupDate = bookingData.pickupDate || existing.pickupDate;
    const eventDate = bookingData.eventDate || existing.eventDate;
    const returnDate = bookingData.returnDate || existing.returnDate;
    const jewelleryIds = bookingData.jewelleryIds || existing.jewelleryIds;

    this.validateBookingDates(pickupDate, eventDate, returnDate);

    if (bookingData.status) {
      this.validateStatusTransition(existing.status, bookingData.status);
    }

    if (jewelleryIds && jewelleryIds.length > 0 && pickupDate && returnDate) {
      await this.checkDateConflicts(jewelleryIds, pickupDate, returnDate, id);
    }

    const oldValue = existing.toObject();
    const updated = await bookingRepository.update(id, bookingData);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'UPDATE_BOOKING',
        entity: 'Booking',
        entityId: id,
        oldValue,
        newValue: updated.toObject()
      });
    }

    return updated;
  }

  async updateBookingStatus(id, { status, paymentStatus }, adminUser = null) {
    const existing = await bookingRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Booking not found', 404);
    }

    if (status) {
      this.validateStatusTransition(existing.status, status);
    }

    const oldValue = { status: existing.status, paymentStatus: existing.paymentStatus };
    if (status) existing.status = status;
    if (paymentStatus) existing.paymentStatus = paymentStatus;

    await existing.save();

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'UPDATE_BOOKING_STATUS',
        entity: 'Booking',
        entityId: id,
        oldValue,
        newValue: { status: existing.status, paymentStatus: existing.paymentStatus }
      });
    }

    return existing;
  }

  async deleteBooking(id, adminUser = null) {
    const existing = await bookingRepository.findById(id);
    if (!existing) {
      throw new ErrorResponse('Booking not found', 404);
    }

    const oldValue = existing.toObject();
    await bookingRepository.delete(id);

    if (adminUser) {
      await auditLogService.logAction({
        adminId: adminUser._id,
        adminEmail: adminUser.email || adminUser.phone,
        action: 'DELETE_BOOKING',
        entity: 'Booking',
        entityId: id,
        oldValue
      });
    }

    return true;
  }
}

module.exports = new BookingService();
