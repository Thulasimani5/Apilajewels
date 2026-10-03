import React from 'react';
import { Plus, Pencil, FileText, Trash2 } from 'lucide-react';

/**
 * BookingsTab
 * -----------
 * Renders the full customer bookings and WhatsApp inquiries table with
 * actions for Edit, Invoice, and Delete.
 */
const BookingsTab = ({
  bookings,
  bookingsLoading,
  onNewBooking,
  onEditBooking,
  onOpenInvoice,
  onDeleteBooking,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="font-semibold text-gray-800 text-base">
            All Customer Bookings & WhatsApp Inquiries
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage customer orders, inquiry logs and add new manual bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            {bookings.length} Total Bookings
          </span>
          <button
            onClick={onNewBooking}
            className="px-4 py-2 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} /> Add New Booking
          </button>
        </div>
      </div>

      {bookingsLoading ? (
        <div className="p-12 text-center text-gray-500">
          Loading bookings history...
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No bookings recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">Booking ID</th>
                <th className="px-4 py-3.5">Customer & Phone</th>
                <th className="px-4 py-3.5">Dates (Event / Pickup / Return)</th>
                <th className="px-4 py-3.5">Jewellery Code & Name</th>
                <th className="px-4 py-3.5">Rental ₹</th>
                <th className="px-4 py-3.5">Advance Paid ₹</th>
                <th className="px-4 py-3.5">Balance ₹</th>
                <th className="px-4 py-3.5">Deposit ₹</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-4 py-3.5">Booking Status</th>
                <th className="px-4 py-3.5">Notes</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b, index) => {
                const customId =
                  b.bookingCustomId || `BK-${String(index + 1).padStart(3, '0')}`;
                const statusKey = (b.status || 'pending').toLowerCase();
                let statusText = 'PENDING';
                let statusClass = 'bg-blue-50 text-blue-700 border border-blue-200';

                if (statusKey === 'confirmed' || statusKey === 'approved') {
                  statusText = 'CONFIRMED';
                  statusClass =
                    'bg-emerald-50 text-emerald-700 border border-emerald-200';
                } else if (statusKey === 'inevent') {
                  statusText = 'IN EVENT';
                  statusClass =
                    'bg-amber-50 text-amber-800 border border-amber-200';
                } else if (statusKey === 'completed') {
                  statusText = 'COMPLETED';
                  statusClass =
                    'bg-indigo-50 text-indigo-700 border border-indigo-200';
                } else if (statusKey === 'rejected') {
                  statusText = 'REJECTED';
                  statusClass =
                    'bg-rose-50 text-rose-700 border border-rose-200';
                }

                const pStatus = b.paymentStatus || 'Pending';
                let pStatusClass = 'bg-gray-100 text-gray-700';
                if (pStatus === 'Paid')
                  pStatusClass = 'bg-green-100 text-green-800 font-bold';
                else if (pStatus === 'Partial')
                  pStatusClass = 'bg-amber-100 text-amber-800 font-bold';

                const rentalSubtotal = b.rentalAmount || b.totalAmount || 0;
                const discPercent = b.discountPercent || 0;
                const discAmt = b.discountAmount || 0;
                const advPaid = b.advancePaid || 0;
                const balAmt =
                  b.balanceAmount ??
                  Math.max(0, rentalSubtotal - discAmt - advPaid);
                const depAmt = b.depositAmount || 0;

                return (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900">
                      {customId}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">
                        {b.customerDetails?.name ||
                          (b.userId?.role !== 'admin' ? b.userId?.name : '') ||
                          'Guest Customer'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {b.customerDetails?.phone ||
                          (b.userId?.role !== 'admin' ? b.userId?.phone : '') ||
                          'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-[11px]">
                      <p>
                        <span className="text-gray-400 font-medium">Event:</span>{' '}
                        <strong className="text-gray-800">
                          {b.eventDate
                            ? new Date(b.eventDate).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </strong>
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        Pickup:{' '}
                        {b.pickupDate
                          ? new Date(b.pickupDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}{' '}
                        | Return:{' '}
                        {b.returnDate
                          ? new Date(b.returnDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 max-w-xs">
                        {Array.isArray(b.jewelleryIds) &&
                          b.jewelleryIds.map((item, i) => (
                            <div
                              key={item._id || i}
                              className="flex items-center gap-2"
                            >
                              <img
                                src={
                                  item.images?.[0]?.url ||
                                  (typeof item.images?.[0] === 'string'
                                    ? item.images[0]
                                    : '') ||
                                  'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'
                                }
                                alt={item.name}
                                className="w-6 h-6 rounded object-cover flex-shrink-0"
                              />
                              <span className="truncate font-medium text-gray-800">
                                {item.name}
                              </span>
                              {(item.code || item.jewelId) && (
                                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.2 rounded font-semibold">
                                  {item.code || item.jewelId}
                                </span>
                              )}
                            </div>
                          ))}
                        {Array.isArray(b.tempJewelleries) &&
                          b.tempJewelleries.map((item, i) => (
                            <div
                              key={`temp-${i}`}
                              className="flex items-center gap-2 mt-1"
                            >
                              <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center flex-shrink-0 text-[10px] text-amber-800 font-bold font-mono">
                                T
                              </div>
                              <span className="truncate font-medium text-amber-900">
                                {item.name} (Temp)
                              </span>
                              {item.code && (
                                <span className="text-[10px] font-mono bg-red-50 text-red-800 border border-red-200/60 px-1.5 py-0.2 rounded font-semibold">
                                  {item.code}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900">
                        ₹
                        {rentalSubtotal
                          ? rentalSubtotal.toLocaleString()
                          : '0'}
                      </p>
                      {discPercent > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          -{discPercent}% (₹{discAmt})
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">
                      {advPaid > 0 ? `₹${advPaid.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-amber-900">
                      {balAmt > 0 ? `₹${balAmt.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {depAmt > 0 ? `₹${depAmt.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pStatusClass}`}
                      >
                        {pStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3.5 text-gray-600 max-w-[120px] truncate"
                      title={b.notes || ''}
                    >
                      {b.notes || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          onClick={() => onEditBooking(b)}
                          className="text-[11px] bg-[#B07A85]/10 text-[#B07A85] px-2.5 py-1 rounded-md hover:bg-[#B07A85] hover:text-white transition-all font-semibold flex items-center gap-1"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => onOpenInvoice(b)}
                          className="text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all font-semibold flex items-center gap-1"
                        >
                          <FileText size={12} /> Invoice
                        </button>
                        <button
                          onClick={() => onDeleteBooking(b._id)}
                          className="text-[11px] bg-red-50 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
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
