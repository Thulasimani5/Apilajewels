import React from 'react';
import { Package, Calendar, Users } from 'lucide-react';

/**
 * DashboardTab
 * ------------
 * Renders the overview statistics grid and the recent bookings + quick
 * actions panel. This is the 'dashboard' tab content only.
 *
 * Props:
 *  - bookings      {Array}
 *  - users         {Array}
 *  - guestCarts    {Array}
 *  - adminJewelleries {Array}
 *  - onNavigate    {(tab: string) => void}  — calls setActiveTab
 *  - onNewBooking  {() => void}
 */
const DashboardTab = ({
  bookings,
  users,
  guestCarts,
  adminJewelleries,
  onNavigate,
  onNewBooking,
}) => {
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

  return (
    <div className="space-y-8 font-sans">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#B07A85] flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Jewellery
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">
              {totalJewelleries}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Bookings
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">
              {totalBookings}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
            <span className="text-xl font-bold">₹</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Revenue
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pending Bookings
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">
              {pendingBookings}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status Sub-analysis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="text-center p-2">
          <span className="text-xs text-gray-500 font-medium">Pending Requests</span>
          <strong className="block text-lg text-blue-700 mt-0.5">{pendingBookings}</strong>
        </div>
        <div className="text-center p-2 border-l border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Confirmed / Approved</span>
          <strong className="block text-lg text-emerald-700 mt-0.5">{confirmedBookings}</strong>
        </div>
        <div className="text-center p-2 border-l border-gray-200">
          <span className="text-xs text-gray-500 font-medium">In Event (Rented Out)</span>
          <strong className="block text-lg text-amber-800 mt-0.5">{ineventBookings}</strong>
        </div>
        <div className="text-center p-2 border-l border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Completed Bookings</span>
          <strong className="block text-lg text-indigo-700 mt-0.5">{completedBookings}</strong>
        </div>
      </div>

      {/* Bottom section: Recent Bookings & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Booking Entries</h3>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs text-[#B07A85] font-bold hover:underline"
            >
              View All Bookings
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No booking entries recorded yet.
              </div>
            ) : (
              bookings.slice(0, 5).map((b, idx) => {
                const customId =
                  b.bookingCustomId || `BK-${String(idx + 1).padStart(3, '0')}`;
                return (
                  <div
                    key={b._id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {customId}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                          {b.bookingDate
                            ? new Date(b.bookingDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 mt-1">
                        {b.customerDetails?.name ||
                          (b.userId?.role !== 'admin' ? b.userId?.name : '') ||
                          'Guest Customer'}{' '}
                        <span className="text-gray-400 font-normal ml-1.5">
                          (
                          {b.customerDetails?.phone ||
                            (b.userId?.role !== 'admin' ? b.userId?.phone : '') ||
                            'No phone'}
                          )
                        </span>
                      </p>
                      <p className="text-[11px] text-[#B07A85] font-medium mt-0.5 truncate max-w-xs">
                        {Array.isArray(b.jewelleryIds)
                          ? b.jewelleryIds.map((item) => item.name).join(', ')
                          : 'No items'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900">
                        ₹{(b.totalAmount || 0).toLocaleString()}
                      </div>
                      <span
                        className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                          ['confirmed', 'approved'].includes(
                            (b.status || '').toLowerCase()
                          )
                            ? 'bg-green-50 text-green-700'
                            : (b.status || 'pending').toLowerCase() === 'pending'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {b.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side: Quick Action Links & Guest Carts summary */}
        <div className="space-y-6">
          {/* Quick Access links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Quick Administrative Tasks</h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <button
                onClick={onNewBooking}
                className="p-3 bg-amber-50/50 hover:bg-amber-50 text-amber-900 border border-amber-100 rounded-xl transition-all font-semibold"
              >
                + New Booking
              </button>
              <button
                onClick={() => onNavigate('jewellery')}
                className="p-3 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-xl transition-all font-semibold"
              >
                Manage Jewels
              </button>
              <button
                onClick={() => onNavigate('categories')}
                className="p-3 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl transition-all font-semibold"
              >
                Categories
              </button>
              <button
                onClick={() => onNavigate('users')}
                className="p-3 bg-purple-50/50 hover:bg-purple-50 text-purple-900 border border-purple-100 rounded-xl transition-all font-semibold"
              >
                User Inquiries
              </button>
            </div>
          </div>

          {/* Guest Inquiries activity box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">
              Live Inquiries Summary
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Registered Users</span>
                <span className="font-bold text-gray-800">{users.length} users</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Guest Visitor Sessions</span>
                <span className="font-bold text-gray-800">
                  {guestCarts.length} sessions
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-500">Average Booking Value</span>
                <span className="font-bold text-gray-800">
                  ₹
                  {totalBookings
                    ? Math.round(totalRevenue / totalBookings).toLocaleString()
                    : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
