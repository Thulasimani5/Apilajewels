import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' }
];

const SortBottomSheet = ({ isOpen, onClose, selectedOption, onSelect }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOptionClick = (optionId) => {
    onSelect(optionId);
    onClose();
  };

  const handleClear = () => {
    onSelect('recommended'); // fallback default
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 transition-opacity"
          />

          {/* Bottom Sheet AJIO Style Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col font-sans overflow-hidden max-h-[60vh] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] md:rounded-xl md:transform-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Sort By</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Sort Options List */}
            <div className="flex-1 overflow-y-auto py-2 px-3">
              {SORT_OPTIONS.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className="w-full flex items-center justify-between py-3.5 px-4 rounded-lg text-left transition-colors hover:bg-gray-50/80 active:bg-gray-100"
                  >
                    <span
                      className={`text-sm ${
                        isSelected ? 'text-orange-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </span>
                    <div className="flex items-center justify-center w-5 h-5">
                      {isSelected && (
                        <Check size={18} className="text-orange-600 font-bold" strokeWidth={3} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Sticky Bar */}
            <div className="bg-white border-t border-gray-150 px-5 py-3.5 flex gap-4 items-center">
              <button
                onClick={handleClear}
                className="flex-1 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider text-center border border-gray-300 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
              >
                Clear / Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#1A1A1A] hover:bg-black uppercase tracking-wider text-center rounded-md active:scale-95 transition-all shadow-sm"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SortBottomSheet;
