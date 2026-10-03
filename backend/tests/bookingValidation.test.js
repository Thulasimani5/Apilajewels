const bookingService = require('../services/bookingService');

describe('Booking Validation and Date Conflict Logic', () => {
  test('should pass when pickupDate <= eventDate <= returnDate', () => {
    expect(() => {
      bookingService.validateBookingDates('2026-10-10', '2026-10-12', '2026-10-15');
    }).not.toThrow();
  });

  test('should throw error when pickupDate > eventDate', () => {
    expect(() => {
      bookingService.validateBookingDates('2026-10-14', '2026-10-12', '2026-10-15');
    }).toThrow('Pickup date must be on or before event date');
  });

  test('should throw error when eventDate > returnDate', () => {
    expect(() => {
      bookingService.validateBookingDates('2026-10-10', '2026-10-16', '2026-10-15');
    }).toThrow('Event date must be on or before return date');
  });

  test('should validate allowed status transitions', () => {
    expect(() => {
      bookingService.validateStatusTransition('pending', 'confirmed');
    }).not.toThrow();

    expect(() => {
      bookingService.validateStatusTransition('confirmed', 'inevent');
    }).not.toThrow();

    expect(() => {
      bookingService.validateStatusTransition('inevent', 'completed');
    }).not.toThrow();
  });

  test('should disallow invalid status transitions', () => {
    expect(() => {
      bookingService.validateStatusTransition('completed', 'pending');
    }).toThrow("Invalid status transition from 'completed' to 'pending'");
  });
});
