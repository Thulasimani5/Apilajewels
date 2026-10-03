import React from 'react';
import { X } from 'lucide-react';

/**
 * UserOrdersModal
 * ---------------
 * Shows the full booking / order history for a selected user or guest.
 *
 * Props:
 *  - data  { user: { name, phone, mobile }, orders: Array }
 *  - onClose () => void
 */
const UserOrdersModal = ({ data, onClose }) => {
  if (!data) return null;
  const { user, orders } = data;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {user.name}'s Order History
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Mobile: {user.phone || user.mobile || 'N/A'} •{' '}
              {orders.length} Total Bookings
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No booking or order history found for this customer.
            </div>
          ) : (
            orders.map((order, idx) => (
              <div
                key={order._id || idx}
                className="rounded-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 bg-gray-50/80 flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700">Order ID: </span>
                    <span className="font-mono text-gray-500">
                      #{order._id?.slice(-8) || idx + 1}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date: </span>
                    <span className="text-gray-500">
                      {order.bookingDate
                        ? new Date(order.bookingDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Booked Jewellery Items:
                  </p>
                  {Array.isArray(order.jewelleryIds) &&
                    order.jewelleryIds.map((item, i) => (
                      <div
                        key={item._id || i}
                        className="flex gap-3 items-center text-sm"
                      >
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.images?.[0]?.url ||
                              item.images?.[0] ||
                              'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            Code: {item.code || item.jewelId || 'N/A'}
                          </p>
                        </div>
                        <div className="font-semibold text-gray-800 text-xs">
                          ₹{item.rentalPrice?.toFixed(2) || item.price?.toFixed(2) || 0}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-700">
                  <span>Total Booking Value:</span>
                  <span className="text-sm font-bold text-gray-900">
                    ₹{order.totalAmount?.toFixed(2) || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersModal;
