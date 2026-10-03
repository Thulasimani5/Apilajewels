import React from 'react';
import { Plus, Printer, Edit, Trash2 } from 'lucide-react';

const BookingsTab = ({
  bookings,
  bookingsLoading,
  onNewBooking,
  onEditBooking,
  onOpenInvoice,
  onDeleteBooking,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Booking Entries</h2>
          <p className="text-xs text-gray-500 font-medium">Manage and generate invoice receipts for customer rentals</p>
        </div>
        <button
          onClick={onNewBooking}
          className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {bookingsLoading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-sm font-medium text-gray-400">Loading booking entries...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-16 text-center text-gray-500">
          No bookings created yet. Click "New Booking" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Event Date</th>
                <th className="px-6 py-4">Pickup / Return</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b, idx) => {
                const customId = b.bookingCustomId || `BK-${String(idx + 1).padStart(3, '0')}`;
                return (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                      {customId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {b.customerDetails?.name || (b.userId?.role !== 'admin' ? b.userId?.name : '') || 'Guest Customer'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.customerDetails?.phone || (b.userId?.role !== 'admin' ? b.userId?.phone : '') || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : 'N/A'} - {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        ['confirmed', 'approved'].includes((b.status || '').toLowerCase())
                          ? 'bg-green-50 text-green-700'
                          : (b.status || 'pending').toLowerCase() === 'pending'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => onOpenInvoice(b)}
                        title="Print Invoice"
                        className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={() => onEditBooking(b)}
                        title="Edit Booking"
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteBooking(b._id)}
                        title="Delete Booking"
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
