import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import CategoryContext from '../context/CategoryContext';

const INITIAL_FILTER_SECTIONS = {
  Colour: ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'],
  Type: ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'],
  Price: ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'],
  Occasion: ['Bridal', 'Festive', 'Party Wear', 'Engagement', 'Daily Wear'],
  StoneName: ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Rose Quartz", "Green Onyx"],
  StoneColour: ["Clear", "Blue", "Pink", "Red", "Green", "Yellow", "White", "Gold", "Various", "Violete", "Orange", "Black", "Purple", "Silver"],
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
    Category: [],
    StoneName: [],
    StoneColour: []
  });

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen && initialFilters) {
      setLocalFilters({
        Colour: initialFilters.Colour || [],
        Type: initialFilters.Type || [],
        Price: initialFilters.Price || [],
        Occasion: initialFilters.Occasion || [],
        Category: initialFilters.Category || [],
        StoneName: initialFilters.StoneName || [],
        StoneColour: initialFilters.StoneColour || []
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
      Category: [],
      StoneName: [],
      StoneColour: []
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

  const [expandedSections, setExpandedSections] = useState({
    Category: true,
    Type: true,
    Occasion: false,
    Price: false,
    Colour: false,
    StoneColour: false,
    StoneName: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sectionLabels = {
    Category: 'CATEGORY',
    Type: 'JEWELLERY TYPE',
    Occasion: 'OCCASION',
    Price: 'PRICE',
    Colour: 'COLOR',
    StoneColour: 'STONE COLOR',
    StoneName: 'STONE'
  };

  const sectionOrder = ['Category', 'Type', 'Occasion', 'Price', 'Colour', 'StoneColour', 'StoneName'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1a1a] z-[40] transition-opacity"
          />

          {/* Bottom Sheet Full Screen Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 w-full h-full bg-white z-[40] pt-[64px] md:pt-[80px] flex flex-col font-sans overflow-hidden md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] md:h-[85vh] md:rounded-2xl md:transform-none"
          >
            {/* Header: <- FILTER */}
            <div className="flex items-center px-6 pt-5 pb-2 bg-white sticky top-0 z-10">
              <button
                onClick={handleApply}
                className="flex items-center gap-4 text-[#111] focus:outline-none hover:opacity-70 transition-opacity"
                aria-label="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                  <path d="M8.26034 1.60917L8.80993 1.09883L7.78926 -0.000363111L7.23966 0.509975L7.75 1.05957L8.26034 1.60917ZM0.75 7.55957L0.239662 7.00997C0.0868364 7.15188 0 7.35102 0 7.55957C0 7.76812 0.0868364 7.96726 0.239662 8.10917L0.75 7.55957ZM7.75 1.05957L7.23966 0.509975L0.239662 7.00997L0.75 7.55957L1.26034 8.10917L8.26034 1.60917L7.75 1.05957ZM0.75 7.55957L0.239662 8.10917L7.23966 14.6092L7.75 14.0596L8.26034 13.51L1.26034 7.00997L0.75 7.55957Z" fill="black" />
                </svg>
                <span style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "11px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "0.84px", textTransform: "uppercase" }}>
                  FILTER
                </span>
              </button>
            </div>

            {/* Accordion Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 pt-0">
              <div className="flex flex-col gap-2">
                {sectionOrder.map((section) => {
                  const isExpanded = expandedSections[section];
                  const options = FILTER_SECTIONS[section] || [];
                  if (options.length === 0) return null;

                  return (
                    <div key={section} className="flex flex-col border-b border-transparent">
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between py-4 text-left focus:outline-none hover:opacity-80 transition-opacity"
                      >
                        <span style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "1.05px", textTransform: "uppercase" }}>
                          {sectionLabels[section]}
                        </span>
                        {!isExpanded && (
                          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      {/* Accordion Body (Checkboxes) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-4 mb-4 mt-2"
                          >
                            {options.map((option) => {
                              const isChecked = localFilters[section]?.includes(option);
                              const displayOption = option === 'Moissinate Jewels' ? 'Victorian & Mossianate' : option;
                              return (
                                <button
                                  key={option}
                                  onClick={() => handleCheckboxChange(section, option)}
                                  className="flex items-center gap-4 text-left focus:outline-none group"
                                >
                                  {/* Custom Checkbox */}
                                  <div
                                    className={`w-[12px] h-[12px] rounded-[2px] flex items-center justify-center transition-all ${isChecked
                                      ? 'bg-black border-black'
                                      : 'border border-gray-400 bg-white group-hover:border-black'
                                      }`}
                                  >
                                    {isChecked && <Check size={8} strokeWidth={4} className="text-white" />}
                                  </div>
                                  <span style={{ color: "#333", fontFamily: "Gotham Book, sans-serif", fontSize: "11px", fontStyle: "normal", fontWeight: 400, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                                    {displayOption}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterBottomSheet;
