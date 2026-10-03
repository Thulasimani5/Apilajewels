import React from 'react';
import { X, Package } from 'lucide-react';

/**
 * JewelDetailsModal
 * -----------------
 * Internal admin view that shows all details for a single jewellery item.
 */
const JewelDetailsModal = ({ jewel, onClose }) => {
  if (!jewel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Left: Image/Video */}
        <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0 relative">
          {jewel.images?.[0]?.type === 'video' ? (
            <video
              src={jewel.images[0].url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={jewel.images?.[0]?.url || jewel.images?.[0]}
              alt={jewel.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Right: Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              Code: {jewel.jewelId}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {jewel.name}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {jewel.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 border-y border-gray-100 py-6 mb-6">
            {[
              { label: 'Category', value: jewel.category || 'N/A' },
              {
                label: 'Type',
                value: Array.isArray(jewel.type)
                  ? jewel.type.join(', ')
                  : jewel.type || 'N/A',
              },
              { label: 'Material', value: jewel.material || 'N/A' },
              { label: 'Finish', value: jewel.finish || 'N/A' },
              {
                label: 'Stone Name',
                value: Array.isArray(jewel.stoneName)
                  ? jewel.stoneName.join(', ')
                  : jewel.stoneName || 'N/A',
              },
              {
                label: 'Stone Colour',
                value: Array.isArray(jewel.stoneColour)
                  ? jewel.stoneColour.join(', ')
                  : jewel.stoneColour || 'N/A',
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  {label}
                </h4>
                <p className="font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-green-500 rounded-full" />
              Financial Details (Internal)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Public Price</span>
                <span className="block font-bold text-lg text-gray-900">
                  ₹{jewel.rentalPrice || jewel.price || 0}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Deposit</span>
                <span className="block font-bold text-lg text-gray-900">
                  ₹{jewel.deposit || 0}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Purchase Amt</span>
                <span className="block font-bold text-lg text-red-600">
                  ₹{jewel.purchaseAmount || 0}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Sales Amt</span>
                <span className="block font-bold text-lg text-green-600">
                  ₹{jewel.salesAmount || 0}
                </span>
              </div>
            </div>
          </div>

          {jewel.shopName && (
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <Package size={18} className="text-blue-500" />
              <span>
                Sourced from:{' '}
                <strong className="text-gray-900">{jewel.shopName}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JewelDetailsModal;
