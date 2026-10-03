import React from 'react';

/**
 * UsersTab
 * --------
 * Displays Registered Customers & Order History table and Guest Visitors & Cookie Consent Data table.
 */
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
  return (
    <div className="space-y-8 font-sans">
      {/* Registered Customers Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-semibold text-gray-800 text-base">
              Registered Customers & Order History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage customer profiles, cart items & booking logs
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#FFF8F3] text-[#B07A85] rounded-full">
            {users.length} Customers
          </span>
        </div>

        {usersLoading ? (
          <div className="p-12 text-center text-gray-500">
            Loading registered users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No users registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs">
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile / Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Active Cart</th>
                  <th className="px-6 py-4">Order History</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const userOrdersList = bookings.filter(
                    (b) =>
                      b.userId?._id === u._id ||
                      b.userId === u._id ||
                      b.customerDetails?.phone === u.phone
                  );
                  const displayUserOrders = [...userOrdersList];
                  if (displayUserOrders.length === 0 && u.cart && u.cart.length > 0) {
                    displayUserOrders.push({
                      _id: `inquiry-${u._id?.slice(-6) || 'cart'}`,
                      bookingDate: u.updatedAt || new Date(),
                      status: 'Inquiry / Saved Cart',
                      jewelleryIds: u.cart,
                      totalAmount: u.cart.reduce(
                        (sum, item) => sum + (item.rentalPrice || item.price || 0),
                        0
                      ),
                    });
                  }
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {u.name || 'Customer'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {u.phone || u.mobile || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {u.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-[#FFF8F3] text-[#B07A85]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-700">
                          {u.cart?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-xs text-blue-700 font-semibold">
                          {displayUserOrders.length} orders
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          onClick={() =>
                            onSelectUserCart({
                              name: u.name || 'Customer',
                              cart: u.cart || [],
                            })
                          }
                          className="text-xs bg-[#B07A85]/10 text-[#B07A85] px-3 py-1.5 rounded-lg hover:bg-[#B07A85] hover:text-white transition-all font-semibold"
                        >
                          View Cart
                        </button>
                        <button
                          onClick={() =>
                            onSelectUserOrders({
                              user: u,
                              orders: displayUserOrders,
                            })
                          }
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-semibold"
                        >
                          View Orders
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

      {/* Guest Visitors & Accepted Cookies Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-semibold text-gray-800 text-base">
              Guest Visitors & Cookie Consent Data
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Tracks guest visitors who accepted cookies and added items to cart
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full">
            {guestCarts.length} Guest Sessions
          </span>
        </div>

        {guestCartsLoading ? (
          <div className="p-12 text-center text-gray-500">
            Loading guest visitor data...
          </div>
        ) : guestCarts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No guest visitor carts recorded yet.
          </div>
        ) : (
          (() => {
            const groupedMap = new Map();
            guestCarts.forEach((g) => {
              const vId = g.visitorId || g._id;
              if (!groupedMap.has(vId)) {
                groupedMap.set(vId, {
                  _id: g._id,
                  visitorId: vId,
                  cart: [...(g.cart || [])],
                  sessionCount: 1,
                  updatedAt: g.updatedAt,
                });
              } else {
                const existing = groupedMap.get(vId);
                existing.sessionCount += 1;
                const existingItemIds = new Set(
                  existing.cart.map((item) => item._id || item)
                );
                (g.cart || []).forEach((item) => {
                  const itemId = item._id || item;
                  if (!existingItemIds.has(itemId)) {
                    existing.cart.push(item);
                    existingItemIds.add(itemId);
                  }
                });
                if (new Date(g.updatedAt) > new Date(existing.updatedAt)) {
                  existing.updatedAt = g.updatedAt;
                }
              }
            });

            const allGrouped = Array.from(groupedMap.values()).sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            const activeGrouped = allGrouped.filter(
              (g) => g.cart && g.cart.length > 0
            );
            const displayedList =
              guestCartFilter === 'active' ? activeGrouped : allGrouped;

            return (
              <div>
                {/* Filter Bar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-gray-50/30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuestCartFilter('active')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        guestCartFilter === 'active'
                          ? 'bg-[#B07A85] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Active Carts With Items ({activeGrouped.length})
                    </button>
                    <button
                      onClick={() => setGuestCartFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        guestCartFilter === 'all'
                          ? 'bg-[#B07A85] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Unique Visitors ({allGrouped.length})
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {guestCarts.length} Total Raw Sessions Merged Into{' '}
                    {allGrouped.length} Unique Visitors
                  </span>
                </div>

                {displayedList.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    {guestCartFilter === 'active'
                      ? 'No active guest carts with items currently.'
                      : 'No guest sessions found.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs">
                          <th className="px-6 py-4">Unique Visitor / Session ID</th>
                          <th className="px-6 py-4">Cookie Consent</th>
                          <th className="px-6 py-4">Merged Cart Items</th>
                          <th className="px-6 py-4">Order History</th>
                          <th className="px-6 py-4">Last Activity</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {displayedList.map((g) => {
                          const visitorOrdersList = bookings.filter(
                            (b) =>
                              b.visitorId === g.visitorId ||
                              (b.customerDetails?.name &&
                                b.customerDetails?.name.includes(
                                  g.visitorId?.slice(0, 8)
                                ))
                          );
                          const displayOrdersList = [...visitorOrdersList];
                          if (
                            displayOrdersList.length === 0 &&
                            g.cart &&
                            g.cart.length > 0
                          ) {
                            displayOrdersList.push({
                              _id: `inquiry-${g.visitorId?.slice(0, 8)}`,
                              bookingDate: g.updatedAt || new Date(),
                              status: 'Inquiry / Saved Cart',
                              jewelleryIds: g.cart,
                              totalAmount: g.cart.reduce(
                                (sum, item) =>
                                  sum + (item.rentalPrice || item.price || 0),
                                0
                              ),
                            });
                          }
                          return (
                            <tr
                              key={g.visitorId || g._id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-gray-900 font-medium">
                                    Visitor #{' '}
                                    {g.visitorId
                                      ? `${g.visitorId.slice(0, 14)}...`
                                      : 'Guest'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  Accepted Cookies
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    g.cart?.length > 0
                                      ? 'bg-[#FFF8F3] text-[#B07A85]'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {g.cart?.length || 0} items
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs">
                                  {displayOrdersList.length} orders
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500">
                                {g.updatedAt
                                  ? new Date(g.updatedAt).toLocaleDateString()
                                  : 'Recent'}
                              </td>
                              <td className="px-6 py-4 flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    onSelectUserCart({
                                      name: `Visitor (${g.visitorId?.slice(0, 8)})`,
                                      cart: g.cart || [],
                                    })
                                  }
                                  className="text-xs bg-[#B07A85]/10 text-[#B07A85] px-3 py-1.5 rounded-lg hover:bg-[#B07A85] hover:text-white transition-all font-semibold"
                                >
                                  View Cart
                                </button>
                                <button
                                  onClick={() =>
                                    onSelectUserOrders({
                                      user: {
                                        name: `Guest (${g.visitorId?.slice(0, 8)})`,
                                        phone: 'WhatsApp Guest',
                                      },
                                      orders: displayOrdersList,
                                    })
                                  }
                                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-semibold"
                                >
                                  View Orders
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
          })()
        )}
      </div>
    </div>
  );
};

export default UsersTab;
