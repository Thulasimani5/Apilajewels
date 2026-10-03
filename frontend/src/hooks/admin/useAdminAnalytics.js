import { useMemo } from 'react';

export const useAdminAnalytics = (bookings, adminJewelleries, users) => {
  return useMemo(() => {
    const totalJewelleries = adminJewelleries.length;
    const totalBookings = bookings.length;
    
    const pendingBookings = bookings.filter(
      (b) => (b.status || 'pending').toLowerCase() === 'pending'
    ).length;
    
    const confirmedBookings = bookings.filter((b) =>
      ['confirmed', 'approved'].includes((b.status || '').toLowerCase())
    ).length;

    const ineventBookings = bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'inevent'
    ).length;

    const completedBookings = bookings.filter(
      (b) => (b.status || '').toLowerCase() === 'completed'
    ).length;

    const totalRevenue = bookings
      .filter((b) => (b.status || '').toLowerCase() !== 'rejected')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalAdvanceCollected = bookings
      .filter((b) => (b.status || '').toLowerCase() !== 'rejected')
      .reduce((sum, b) => sum + (b.advancePaid || 0), 0);

    const totalBalanceOutstanding = bookings
      .filter((b) => (b.status || '').toLowerCase() !== 'rejected')
      .reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

    return {
      totalJewelleries,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      ineventBookings,
      completedBookings,
      totalRevenue,
      totalAdvanceCollected,
      totalBalanceOutstanding,
      totalUsers: users.length
    };
  }, [bookings, adminJewelleries, users]);
};
