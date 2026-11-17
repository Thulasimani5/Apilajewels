import { useMemo } from 'react';

export const useAdminAnalytics = (bookings, adminJewelleries, users) => {
  return useMemo(() => {
    const totalJewelleries = adminJewelleries.length;
    const totalBookings = bookings.length;
    
    const pendingBookings = bookings.filter(
      (b) => (b.status || 'pending').toLowerCase() === 'pending'
    ).length;

    const now = new Date();
    const ineventBookings = bookings.filter((b) => {
      if (!b.pickupDate || !b.returnDate) return false;
      const start = new Date(b.pickupDate);
      const end = new Date(b.returnDate);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    }).length;

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
      ineventBookings,
      completedBookings,
      totalRevenue,
      totalAdvanceCollected,
      totalBalanceOutstanding,
      totalUsers: users.length
    };
  }, [bookings, adminJewelleries, users]);
};
