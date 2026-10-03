import React from 'react';
import { X } from 'lucide-react';

/**
 * UserCartModal
 * -------------
 * Shows the cart contents of a selected user or guest visitor.
 */
const UserCartModal = ({ cart, selectedUserCart, onClose }) => {
  const currentCartObj = cart || selectedUserCart;
  if (!currentCartObj) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{currentCartObj.name}'s Cart</h3>
            <p className="text-xs text-gray-400 mt-0.5">{(currentCartObj.cart || []).length} items in list</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!(currentCartObj.cart && currentCartObj.cart.length) ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Their cart is currently empty.
            </div>
          ) : (
            currentCartObj.cart.map((item, idx) => (
              <div
                key={item._id || idx}
                className="flex gap-4 p-3 rounded-xl border border-gray-100 items-center"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={
                      item.images?.[0]?.url ||
                      item.images?.[0] ||
                      'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {item.type || item.category}
                  </p>
                  <h4 className="font-bold text-gray-800 text-sm truncate leading-snug mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Code: {item.jewelId || 'N/A'}
                  </p>
                </div>
                <div className="font-bold text-sm text-gray-950">
                  ₹{item.rentalPrice?.toFixed(2) || item.price?.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
          <span className="font-semibold text-gray-500">Estimated Rental Total:</span>
          <span className="font-bold text-lg text-gray-950">
            ₹
            {(currentCartObj.cart || [])
              .reduce((total, item) => total + (item.rentalPrice || item.price || 0), 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCartModal;
