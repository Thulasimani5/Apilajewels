import React from 'react';
import { X } from 'lucide-react';
import { BOOKING_STATUSES, PAYMENT_STATUSES } from '../../constants/admin/adminConstants';

/**
 * BookingFormModal
 * ----------------
 * Full-screen form for creating or editing a customer booking.
 *
 * Props:
 *  - isEditing          {boolean}    - true when editing an existing booking
 *  - bookingData        {object}     - current form state (newBookingData)
 *  - setBookingData     {fn}         - setter for bookingData
 *  - adminJewelleries   {Array}      - all catalogue jewelleries (for selector)
 *  - jewelsCount        {number}     - bookings.length for auto-ID suggestion
 *  - jewelCodeSearch    {string}
 *  - setJewelCodeSearch {fn}
 *  - onClose            {fn}
 *  - onSave             {fn}         - form onSubmit handler
 *  - loading            {boolean}
 *  - onAddTempJewel     {fn}         - opens the temp jewel modal
 */
const BookingFormModal = ({
  isEditing,
  bookingData,
  setBookingData,
  adminJewelleries,
  jewelsCount,
  jewelCodeSearch,
  setJewelCodeSearch,
  onClose,
  onSave,
  loading,
  onAddTempJewel,
}) => {
  // ── Computed subtotals ─────────────────────────────────────────────────────
  const regularSubtotal = adminJewelleries
    .filter((j) => bookingData.jewelleryIds.includes(j._id))
    .reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0);
  const tempSubtotal = (bookingData.tempJewelleries || []).reduce(
    (sum, j) => sum + (parseFloat(j.rentalPrice) || 0),
    0
  );
  const subtotal = regularSubtotal + tempSubtotal;
  const dPercent = parseFloat(bookingData.discountPercent) || 0;
  const dAmountInput = parseFloat(bookingData.discountAmount) || 0;
  const discountAmount = dAmountInput > 0 ? dAmountInput : (subtotal * dPercent) / 100;
  const netAmount = Math.max(0, subtotal - discountAmount);
  const advPaid = parseFloat(bookingData.advancePaid) || 0;
  const balAmt = Math.max(0, netAmount - advPaid);

  const selectedDbItems = adminJewelleries.filter((j) =>
    bookingData.jewelleryIds.includes(j._id)
  );
  const tempItems = bookingData.tempJewelleries || [];
  const totalCount = selectedDbItems.length + tempItems.length;

  const update = (field, value) =>
    setBookingData((prev) => ({ ...prev, [field]: value }));

  const filteredJewelleries = adminJewelleries.filter((j) => {
    if (!jewelCodeSearch.trim()) return true;
    const q = jewelCodeSearch.toLowerCase();
    return (
      (j.code && j.code.toLowerCase().includes(q)) ||
      (j.jewelId && j.jewelId.toLowerCase().includes(q)) ||
      (j.name && j.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Customer Booking Entry' : 'Add New Customer Rental Booking'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Record customer rental details, dates, jewel selection, advance, balance &amp; notes
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
          >
            <X size={18} /> Close &amp; Exit
          </button>
        </div>

        <form onSubmit={onSave} className="mt-5 space-y-5">
          {/* Row 1: Booking ID, Customer Name, Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Booking ID
              </label>
              <input
                type="text"
                placeholder={`e.g. BK-${String(jewelsCount + 1).padStart(3, '0')}`}
                value={bookingData.bookingCustomId}
                onChange={(e) => update('bookingCustomId', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Customer Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Karthiga akka"
                value={bookingData.customerName}
                onChange={(e) => update('customerName', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Customer Mobile / Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 98765xxxxx"
                value={bookingData.customerPhone}
                onChange={(e) => update('customerPhone', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
              />
            </div>
          </div>

          {/* Row 2: Event Date, Pickup Date, Return Date, Booking Place */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Event Date', field: 'eventDate', type: 'date' },
              { label: 'Pickup Date', field: 'pickupDate', type: 'date' },
              { label: 'Return Date', field: 'returnDate', type: 'date' },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={bookingData[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Booking Place / Venue
              </label>
              <input
                type="text"
                placeholder="e.g. Chennai Hall"
                value={bookingData.bookingPlace}
                onChange={(e) => update('bookingPlace', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
              />
            </div>
          </div>

          {/* Row 3: Jewel Code Selection */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase text-gray-600">
                Select Jewellery Items by Jewel Code*
              </label>
              <span className="text-xs text-[#B07A85] font-bold">
                {totalCount} Items Selected
              </span>
            </div>

            <input
              type="text"
              placeholder="Search by Jewel Code (e.g. JWL-102, PK024) or Name..."
              value={jewelCodeSearch}
              onChange={(e) => setJewelCodeSearch(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] mb-3 bg-gray-50/50"
            />

            <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
              {filteredJewelleries.map((j) => {
                const isSelected = bookingData.jewelleryIds.includes(j._id);
                const p = j.rentalPrice || j.price || 0;
                return (
                  <div
                    key={j._id}
                    onClick={() => {
                      setBookingData((prev) => ({
                        ...prev,
                        jewelleryIds: isSelected
                          ? prev.jewelleryIds.filter((id) => id !== j._id)
                          : [...prev.jewelleryIds, j._id],
                      }));
                    }}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FFF8F3]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          j.images?.[0]?.url ||
                          (typeof j.images?.[0] === 'string' ? j.images[0] : '') ||
                          'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'
                        }
                        alt={j.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {j.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          Code:{' '}
                          <span className="font-bold text-amber-800">
                            {j.code || j.jewelId || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-800">₹{p}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-[#B07A85] text-white'
                            : 'border border-gray-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Temporary Jewellery */}
            <div className="mt-4 p-4 bg-[#FFF8F3] rounded-2xl border border-[#B07A85]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Custom / Temporary Jewellery Item
                </h4>
                <p className="text-xs text-gray-500">
                  Renting an unlisted item for this booking? Add custom details &amp; image
                  without cluttering main DB catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddTempJewel}
                className="px-5 py-2.5 bg-[#B07A85] hover:bg-[#9E6A75] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                + Add Temporary Jewellery
              </button>
            </div>

            {/* Unified selected items list */}
            {totalCount > 0 && (
              <div className="mt-4 p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    ALL SELECTED JEWELLERY ITEMS FOR THIS BOOKING ({totalCount}):
                  </h4>
                  <span className="text-[11px] text-[#B07A85] font-bold">
                    {selectedDbItems.length} Catalogue + {tempItems.length} Temp Custom
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedDbItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between text-xs bg-white border border-gray-200 p-3 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.images?.[0]?.url ||
                            (typeof item.images?.[0] === 'string' ? item.images[0] : '') ||
                            'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'
                          }
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Catalogue
                            </span>
                          </div>
                          <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                            {item.code || item.jewelId || 'JWL'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-900">
                          Rent: ₹{item.rentalPrice || item.price || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingData((prev) => ({
                              ...prev,
                              jewelleryIds: prev.jewelleryIds.filter((id) => id !== item._id),
                            }))
                          }
                          className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs transition-colors"
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {tempItems.map((item, idx) => (
                    <div
                      key={`temp-${idx}`}
                      className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200 p-3 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-amber-300 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xs text-amber-800 font-bold font-mono flex-shrink-0">
                            TEMP
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-950 text-sm">{item.name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                              Temp Item
                            </span>
                          </div>
                          <span className="text-[11px] font-mono bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                            {item.code || 'TEMP'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rent: ₹{item.rentalPrice}</p>
                          {item.deposit > 0 && (
                            <p className="text-[11px] text-gray-500">Deposit: ₹{item.deposit}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingData((prev) => {
                              const updatedTempList = prev.tempJewelleries.filter(
                                (_, i) => i !== idx
                              );
                              return {
                                ...prev,
                                tempJewelleries: updatedTempList,
                                depositAmount: Math.max(
                                  0,
                                  (prev.depositAmount || 0) - (item.deposit || 0)
                                ),
                              };
                            })
                          }
                          className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold flex items-center justify-center text-xs transition-colors"
                          title="Remove Item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Financial Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-100">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 10"
                value={bookingData.discountPercent === 0 ? '' : bookingData.discountPercent}
                disabled={parseFloat(bookingData.discountAmount) > 0}
                onChange={(e) => {
                  const pct = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                  setBookingData((prev) => ({ ...prev, discountPercent: pct, discountAmount: 0 }));
                }}
                className={`w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] ${
                  parseFloat(bookingData.discountAmount) > 0
                    ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed border-gray-200/50'
                    : 'bg-white text-gray-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Discount Amount ₹
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={bookingData.discountAmount === 0 ? '' : bookingData.discountAmount}
                disabled={parseFloat(bookingData.discountPercent) > 0}
                onChange={(e) => {
                  const amt = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                  setBookingData((prev) => ({ ...prev, discountAmount: amt, discountPercent: 0 }));
                }}
                className={`w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] font-semibold ${
                  parseFloat(bookingData.discountPercent) > 0
                    ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed border-gray-200/50'
                    : 'bg-white text-gray-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Advance Paid ₹
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1000"
                value={bookingData.advancePaid === 0 ? '' : bookingData.advancePaid}
                onChange={(e) => {
                  const val = e.target.value;
                  setBookingData((prev) => ({
                    ...prev,
                    advancePaid: val === '' ? '' : parseFloat(val) || 0,
                  }));
                }}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Deposit ₹
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1000"
                value={bookingData.depositAmount === 0 ? '' : bookingData.depositAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setBookingData((prev) => ({
                    ...prev,
                    depositAmount: val === '' ? '' : parseFloat(val) || 0,
                  }));
                }}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* Row 5: Payment Status, Booking Status, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Payment Status
              </label>
              <select
                value={bookingData.paymentStatus}
                onChange={(e) => update('paymentStatus', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Booking Status
              </label>
              <select
                value={bookingData.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Notes / Special Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Pink set"
                value={bookingData.notes}
                onChange={(e) => update('notes', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
              />
            </div>
          </div>

          {/* Total & Balance Calculation Summary */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Rental Subtotal (Selected Items):</span>
              <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
            </div>
            {dAmountInput > 0 ? (
              <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                <span>Flat Discount:</span>
                <span>-₹{dAmountInput.toFixed(2)}</span>
              </div>
            ) : dPercent > 0 ? (
              <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                <span>Discount ({dPercent}% OFF):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center text-xs text-gray-700 font-medium">
              <span>Net Rental Total:</span>
              <span>₹{netAmount.toFixed(2)}</span>
            </div>
            {advPaid > 0 && (
              <div className="flex justify-between items-center text-xs text-blue-600 font-medium">
                <span>Advance Paid:</span>
                <span>-₹{advPaid.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
              <span className="font-bold text-gray-900">Remaining Balance ₹:</span>
              <span className="font-bold text-amber-800 text-lg">₹{balAmt.toFixed(2)}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#B07A85] text-white rounded-xl text-xs font-semibold hover:bg-[#9E6A75] transition-colors flex items-center gap-2"
            >
              {loading
                ? 'Saving...'
                : isEditing
                ? 'Update Booking Entry'
                : 'Create Booking Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;
