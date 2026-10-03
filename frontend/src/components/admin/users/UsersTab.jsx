import React from 'react';
import { ShoppingBag, Eye, User, ShoppingCart } from 'lucide-react';

const UsersTab = ({
  users,
  usersLoading,
  guestCarts,
  guestCartsLoading,
  guestCartFilter,
  setGuestCartFilter,
  bookings,
  onSelectUserCart,
  onSelectUserOrders,
}) => {
  const activeGuestCarts = (guestCarts || []).filter((gc) => gc.cart && gc.cart.length > 0);
  const emptyGuestCarts = (guestCarts || []).filter((gc) => !gc.cart || gc.cart.length === 0);
  const displayedGuestCarts = guestCartFilter === 'active' ? activeGuestCarts : emptyGuestCarts;

  return (
    <div className="space-y-8 font-sans">
      {/* Section 1: Registered Accounts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Registered User Accounts</h2>
            <p className="text-xs text-gray-500 font-medium">All registered accounts, saved carts &amp; order history</p>
          </div>
          <span className="bg-[#FFF8F3] text-[#B07A85] text-xs font-bold px-3 py-1 rounded-full border border-[#B07A85]/20">
            {users.length} Users Total
          </span>
        </div>

        {usersLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span className="text-sm font-medium text-gray-400">Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-gray-500">No registered users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Saved Cart</th>
                  <th className="px-6 py-4">Bookings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const cartCount = u.cart ? u.cart.length : 0;
                  const userOrders = (bookings || []).filter((b) => b.userId && b.userId._id === u._id);
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : <User size={16} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.name || 'Anonymous User'}</div>
                            <div className="text-xs text-gray-500">{u.email || u.phone || 'No contact'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cartCount > 0 ? (
                          <button
                            onClick={() => onSelectUserCart(u)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B07A85] bg-[#FFF8F3] hover:bg-[#B07A85] hover:text-white px-3 py-1 rounded-full border border-[#B07A85]/30 transition-all shadow-sm"
                          >
                            <ShoppingCart size={12} /> {cartCount} Items
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Empty</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {userOrders.length > 0 ? (
                          <button
                            onClick={() => onSelectUserOrders({ user: u, orders: userOrders })}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-full border border-blue-200 transition-all shadow-sm"
                          >
                            <ShoppingBag size={12} /> {userOrders.length} Orders
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">No Orders</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectUserOrders({ user: u, orders: userOrders })}
                          className="text-xs font-bold text-gray-600 hover:text-[#B07A85] inline-flex items-center gap-1"
                        >
                          <Eye size={14} /> Profile
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

      {/* Section 2: Anonymous Guest Carts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Guest Visitor Carts</h2>
            <p className="text-xs text-gray-500 font-medium">Anonymous visitor sessions &amp; items placed in cart</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setGuestCartFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                guestCartFilter === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Active Carts ({activeGuestCarts.length})
            </button>
            <button
              onClick={() => setGuestCartFilter('empty')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                guestCartFilter === 'empty' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Empty Sessions ({emptyGuestCarts.length})
            </button>
          </div>
        </div>

        {guestCartsLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <span className="text-sm font-medium text-gray-400">Loading guest visitor carts...</span>
          </div>
        ) : displayedGuestCarts.length === 0 ? (
          <div className="p-16 text-center text-gray-500">No {guestCartFilter} guest carts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Visitor Session ID</th>
                  <th className="px-6 py-4">Cart Count</th>
                  <th className="px-6 py-4">Expires At</th>
                  <th className="px-6 py-4 text-right">View Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedGuestCarts.map((gc) => (
                  <tr key={gc._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 font-bold">
                      {gc.visitorId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{gc.cart ? gc.cart.length : 0} items</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {gc.expiresAt ? new Date(gc.expiresAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {gc.cart && gc.cart.length > 0 ? (
                        <button
                          onClick={() => onSelectUserCart({ name: `Guest (${gc.visitorId.slice(0, 8)})`, cart: gc.cart })}
                          className="text-xs font-bold text-[#B07A85] hover:underline"
                        >
                          Inspect Cart
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
