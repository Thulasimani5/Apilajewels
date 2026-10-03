import React, { useState } from 'react';
import { Printer, GripVertical } from 'lucide-react';

/**
 * InvoiceModal
 * ------------
 * Full-screen invoice preview with drag-to-reorder items and print/PDF export.
 */
const InvoiceModal = ({ booking, initialItems, onClose }) => {
  const [invoiceItems, setInvoiceItems] = useState(initialItems || []);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  if (!booking) return null;

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setInvoiceItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handlePrint = () => {
    const printEl = document.getElementById('printable-invoice');
    if (!printEl) { window.print(); return; }
    const customId = booking.customId || `BK-${booking._id?.slice(-8)}`;
    const invoiceHtml = printEl.innerHTML;
    const printWin = window.open('', '_blank', 'width=1150,height=900');
    if (!printWin) { window.print(); return; }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice_${customId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 2rem;
              background-color: #ffffff !important;
              color: #111827 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            @page { size: A4 portrait; margin: 10mm; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body class="bg-white">
          <div class="max-w-5xl mx-auto border border-gray-100 p-6 rounded-2xl shadow-none">
            ${invoiceHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const subtotal = booking.rentalAmount || booking.totalAmount || 0;
  const discPercent = booking.discountPercent || 0;
  const discAmt = booking.discountAmount || 0;
  const netTotal = Math.max(0, subtotal - discAmt);
  const advPaid = booking.advancePaid || 0;
  const balAmt = booking.balanceAmount ?? Math.max(0, netTotal - advPaid);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto no-print"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden border border-gray-100 mt-4 mb-12 relative">

        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center no-print">
          <span className="text-sm font-semibold text-gray-700">Invoice Preview</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReordering((v) => !v)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
                isReordering
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {isReordering ? '✓ Done Reordering' : '⇅ Reorder Items'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div
          className="p-8 sm:p-12 text-gray-800 font-sans print-area bg-white text-left"
          id="printable-invoice"
        >
          <div className="flex justify-between items-start pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">INVOICE</h1>
              <p className="text-sm font-mono text-gray-500 mt-1">
                {booking.customId || `BK-${booking._id?.slice(-8)}`}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-[#B07A85] tracking-wide">Apila Jewels</h2>
              <p className="text-xs text-gray-500 mt-0.5">apila.jewels@gmail.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 text-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-2">BILL TO</h3>
              <p className="font-bold text-gray-900 text-base">
                {booking.customerDetails?.name ||
                  (booking.userId?.role !== 'admin' ? booking.userId?.name : '') ||
                  'Guest Customer'}
              </p>
              {booking.customerDetails?.address && (
                <p className="text-gray-500 mt-0.5">{booking.customerDetails.address}</p>
              )}
              <p className="text-gray-500 font-mono mt-0.5">
                {booking.customerDetails?.phone ||
                  (booking.userId?.role !== 'admin' ? booking.userId?.phone : '') ||
                  'N/A'}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-gray-500">
                <span className="font-semibold text-gray-700">Issue Date: </span>
                {booking.bookingDate
                  ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : new Date().toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold text-gray-700">Due Date: </span>
                {booking.eventDate
                  ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : 'N/A'}
              </p>
              <p className="text-gray-500">
                <span className="font-semibold text-gray-700">Payment Method: </span>
                {booking.paymentStatus === 'Paid' ? 'Paid' : 'Other'}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                  <th className="px-4 py-3 w-10 text-center">#</th>
                  {isReordering && (
                    <th className="px-2 py-3 w-12 text-center no-print bg-amber-50 text-amber-900 font-bold">
                      DRAG
                    </th>
                  )}
                  <th className="px-4 py-3 w-16 text-center">IMAGE</th>
                  <th className="px-5 py-3">NAME</th>
                  <th className="px-4 py-3 text-center w-16">QTY</th>
                  <th className="px-5 py-3 text-right w-28">RATE</th>
                  <th className="px-5 py-3 text-right w-28">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoiceItems.map((item, idx) => {
                  const rate = item.rentalPrice || item.price || 0;
                  const imgSrc =
                    item.image ||
                    (Array.isArray(item.images)
                      ? item.images[0]?.url || item.images[0]
                      : item.images);

                  return (
                    <tr
                      key={item._id || `item-${idx}`}
                      draggable={isReordering}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`transition-all ${
                        isReordering
                          ? 'cursor-grab active:cursor-grabbing hover:bg-amber-50/50'
                          : 'hover:bg-gray-50/30'
                      } ${
                        draggedIndex === idx
                          ? 'opacity-40 bg-amber-100/70 border-2 border-dashed border-[#B07A85]'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono text-center">{idx + 1}</td>
                      {isReordering && (
                        <td className="px-2 py-3 text-center no-print bg-amber-50/40 border-x border-amber-100">
                          <div className="flex items-center justify-center text-amber-800 cursor-grab">
                            <GripVertical size={18} className="text-amber-700" />
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover mx-auto border border-gray-200 shadow-sm"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 mx-auto font-mono">
                            NO IMG
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {item.name}
                        {!item.isTemp && (item.code || item.jewelId) && (
                          <span className="ml-2 text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded font-semibold">
                            {item.code || item.jewelId}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 font-medium">1</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-700">
                        ₹{rate.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        ₹{rate.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {discPercent > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-medium">
                  <span>Discount ({discPercent}% OFF)</span>
                  <span>-₹{discAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-gray-900 font-bold text-base">
                <span>Total</span>
                <span className="text-[#B07A85] text-lg">₹{netTotal.toFixed(2)}</span>
              </div>
              {advPaid > 0 && (
                <div className="flex justify-between items-center text-blue-600 font-semibold pt-1">
                  <span>Advance Paid</span>
                  <span>-₹{advPaid.toFixed(2)}</span>
                </div>
              )}
              {balAmt > 0 && (
                <div className="flex justify-between items-center text-amber-800 font-bold pt-1 border-t border-dashed border-gray-200">
                  <span>Balance Due</span>
                  <span>₹{balAmt.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          <div className="space-y-4 text-xs text-gray-500">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 mb-1">
                NOTES
              </h4>
              <p>
                Security Deposit (Fully Refundable Upon Jewellery Return):{' '}
                <strong className="text-gray-800 font-bold">
                  ₹{(booking.depositAmount || 0).toLocaleString()}
                </strong>
              </p>
              {booking.notes && (
                <p className="mt-1">
                  <span className="font-semibold text-gray-600">Special Remarks:</span>{' '}
                  {booking.notes}
                </p>
              )}
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 mb-1">
                TERMS &amp; CONDITIONS
              </h4>
              <p>
                Security Deposit: Fully refundable upon return of the jewellery. Damage or
                loss will be adjusted from the deposit.
              </p>
            </div>
          </div>

          <div className="text-center pt-8 text-xs text-gray-400 font-medium mt-8 border-t border-gray-50">
            Thank you for choosing Apila Jewels.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
