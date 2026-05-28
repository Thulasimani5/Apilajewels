import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import CategoryContext from '../context/CategoryContext';

const INITIAL_FILTER_SECTIONS = {
  Colour: ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'],
  Type: ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'],
  Price: ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'],
  Occasion: ['Bridal', 'Festive', 'Party Wear', 'Engagement', 'Daily Wear'],
  Category: [] // Populated dynamically
};

const FilterBottomSheet = ({ isOpen, onClose, initialFilters, onApply }) => {
  const { categories } = React.useContext(CategoryContext);
  
  const FILTER_SECTIONS = React.useMemo(() => {
    return {
      ...INITIAL_FILTER_SECTIONS,
      Category: categories.map(c => c.name)
    };
  }, [categories]);

  // Currently active category in the left pane
  const [activeCategory, setActiveCategory] = useState('Colour');

  // Local state for active filters in the modal before applying
  const [localFilters, setLocalFilters] = useState({
    Colour: [],
    Type: [],
    Price: [],
    Occasion: [],
    Category: []
  });

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen && initialFilters) {
      setLocalFilters({
        Colour: initialFilters.Colour || [],
        Type: initialFilters.Type || [],
        Price: initialFilters.Price || [],
        Occasion: initialFilters.Occasion || [],
        Category: initialFilters.Category || []
      });
    }
  }, [isOpen, initialFilters]);

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

  const handleCheckboxChange = (category, value) => {
    setLocalFilters((prev) => {
      const currentCategoryList = prev[category] || [];
      const updatedCategoryList = currentCategoryList.includes(value)
        ? currentCategoryList.filter((item) => item !== value)
        : [...currentCategoryList, value];
      return {
        ...prev,
        [category]: updatedCategoryList
      };
    });
  };

  const handleReset = () => {
    setLocalFilters({
      Colour: [],
      Type: [],
      Price: [],
      Occasion: [],
      Category: []
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  // Helper to count selected filters in a specific category
  const getSelectedCount = (category) => {
    return localFilters[category]?.length || 0;
  };

  // Helper to count ALL selected filters
  const getTotalSelectedCount = () => {
    return Object.keys(localFilters).reduce(
      (total, key) => total + (localFilters[key]?.length || 0),
      0
    );
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
            className="fixed bottom-0 left-0 right-0 h-[80vh] md:h-[70vh] bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col font-sans overflow-hidden md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] md:rounded-xl md:transform-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Filters</h2>
                {getTotalSelectedCount() > 0 && (
                  <span className="bg-orange-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {getTotalSelectedCount()} Selected
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Split Screen Layout (AJIO Style) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Categories Selection List */}
              <div className="w-[38%] bg-gray-50 overflow-y-auto border-r border-gray-200">
                {Object.keys(FILTER_SECTIONS).map((category) => {
                  const isActive = activeCategory === category;
                  const count = getSelectedCount(category);

                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-4 py-4 text-xs font-semibold uppercase tracking-wider relative transition-all border-b border-gray-100 flex items-center justify-between ${
                        isActive
                          ? 'bg-white text-gray-900 font-bold border-l-4 border-orange-500'
                          : 'text-gray-500 hover:bg-gray-100 border-l-4 border-transparent'
                      }`}
                    >
                      <span>{category}</span>
                      {count > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-200 text-gray-800 text-[10px] rounded-full font-bold">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Values Multi-Select Options */}
              <div className="w-[62%] bg-white overflow-y-auto p-4">
                <div className="space-y-1">
                  {FILTER_SECTIONS[activeCategory].map((option) => {
                    const isChecked = localFilters[activeCategory]?.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => handleCheckboxChange(activeCategory, option)}
                        className={`w-full flex items-center justify-between py-3 px-3 rounded-lg text-left transition-colors ${
                          isChecked ? 'bg-orange-50/60' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            isChecked ? 'text-orange-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </span>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-gray-350 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions Sticky Bar */}
            <div className="bg-white border-t border-gray-200 px-5 py-3.5 flex gap-4 items-center">
              <button
                onClick={handleReset}
                className="flex-1 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider text-center border border-gray-300 rounded-md hover:bg-gray-50 active:scale-95 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#1A1A1A] hover:bg-black uppercase tracking-wider text-center rounded-md active:scale-95 transition-all shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterBottomSheet;
