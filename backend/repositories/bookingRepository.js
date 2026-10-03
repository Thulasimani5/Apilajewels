const Booking = require('../models/Booking');

class BookingRepository {
  async findById(id) {
    return await Booking.findById(id)
      .populate('userId', 'name email phone role')
      .populate('jewelleryIds');
  }

  async findByCustomId(customId) {
    return await Booking.findOne({ bookingCustomId: customId })
      .populate('userId', 'name email phone role')
      .populate('jewelleryIds');
  }

  async findAll() {
    return await Booking.find({})
      .populate('userId', 'name email phone role')
      .populate('jewelleryIds')
      .sort('-createdAt');
  }

  async findByUser(userId) {
    return await Booking.find({ userId })
      .populate('jewelleryIds')
      .sort('-createdAt');
  }

  async findOverlappingBookings(jewelleryIds, pickupDate, returnDate, excludeBookingId = null) {
    if (!jewelIds || !jewelleryIds.length || !pickupDate || !returnDate) return [];

    const query = {
      jewelleryIds: { $in: jewelleryIds },
      status: { $in: ['pending', 'approved', 'confirmed', 'inevent'] },
      pickupDate: { $lte: new Date(returnDate) },
      returnDate: { $gte: new Date(pickupDate) }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    return await Booking.find(query).populate('jewelleryIds', 'name jewelId');
  }

  async create(bookingData) {
    return await Booking.create(bookingData);
  }

  async update(id, bookingData) {
    return await Booking.findByIdAndUpdate(id, bookingData, { new: true, runValidators: true })
      .populate('userId', 'name email phone role')
      .populate('jewelleryIds');
  }

  async delete(id) {
    return await Booking.findByIdAndDelete(id);
  }
}

module.exports = new BookingRepository();
