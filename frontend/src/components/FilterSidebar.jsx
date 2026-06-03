import React, { useState, useMemo, useContext } from 'react';
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import CategoryContext from '../context/CategoryContext';

/* ── Filter options (same data as FilterBottomSheet) ── */
const COLOUR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const TYPE_OPTIONS = ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'];
const PRICE_OPTIONS = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const OCCASION_OPTIONS = ['Bridal', 'Festive', 'Party Wear', 'Engagement', 'Daily Wear'];

/* ── Colour swatch map ── */
const COLOUR_SWATCHES = {
  'Gold': '#D4AF37',
  'Silver': '#C0C0C0',
  'Rose Gold': '#B76E79',
  'Emerald Green': '#50C878',
  'Ruby Red': '#E0115F',
  'Mehndi Polish': '#8B6914',
};

/* ── Collapsible filter section ── */
const FilterSection = ({ title, children, defaultOpen = true, selectedCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#F0EDED]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FDFBFA] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-[0.06em]">
            {title}
          </span>
          {selectedCount > 0 && (
            <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-[#A56D7A] text-white text-[10px] rounded-full font-bold px-1.5">
              {selectedCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-[#888] group-hover:text-[#1A1A1A] transition-colors" />
        ) : (
          <ChevronDown size={16} className="text-[#888] group-hover:text-[#1A1A1A] transition-colors" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ── Checkbox item ── */
const CheckboxItem = ({ label, checked, onChange, count, colorSwatch }) => (
  <label
    className={`flex items-center gap-3 py-[7px] px-2 rounded-lg cursor-pointer transition-colors group ${
      checked ? 'bg-[#FFF8F3]' : 'hover:bg-[#FDFBFA]'
    }`}
  >
    {/* Custom checkbox */}
    <div
      className={`w-[18px] h-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked
          ? 'bg-[#A56D7A] border-[#A56D7A]'
          : 'border-[#CCCCCC] bg-white group-hover:border-[#A56D7A]/50'
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>

    {/* Color swatch (for colour filters) */}
    {colorSwatch && (
      <span
        className="w-[14px] h-[14px] rounded-full border border-gray-200 flex-shrink-0"
        style={{ backgroundColor: colorSwatch }}
      />
    )}

    {/* Label */}
    <span className={`text-[13px] flex-1 transition-colors ${
      checked ? 'text-[#A56D7A] font-semibold' : 'text-[#333] font-normal'
    }`}>
      {label}
    </span>

    {/* Count badge */}
    {count !== undefined && count > 0 && (
      <span className="text-[11px] text-[#999] font-normal">
        ({count})
      </span>
    )}

    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
  </label>
);


/* ═══════════════════════════════════════════════
   FilterSidebar — Myntra-style left panel
   ═══════════════════════════════════════════════ */
const FilterSidebar = ({ activeFilters, onFilterChange, products = [] }) => {
  const { categories } = useContext(CategoryContext);
  const [searchTerms, setSearchTerms] = useState({});

  const categoryOptions = useMemo(() => categories.map(c => c.name), [categories]);

  /* ── Compute counts for each filter value from the full product list ── */
  const counts = useMemo(() => {
    const result = { Category: {}, Colour: {}, Type: {}, Price: {}, Occasion: {} };

    products.forEach(p => {
      // Category counts
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      cats.forEach(c => {
        if (c) result.Category[c] = (result.Category[c] || 0) + 1;
      });

      // Colour counts
      const colours = Array.isArray(p.colour) ? p.colour : [p.colour];
      colours.forEach(c => {
        if (c) result.Colour[c] = (result.Colour[c] || 0) + 1;
      });

      // Type counts
      const types = Array.isArray(p.type) ? p.type : [p.type];
      types.forEach(t => {
        if (t) result.Type[t] = (result.Type[t] || 0) + 1;
      });

      // Occasion counts
      if (Array.isArray(p.occasion)) {
        p.occasion.forEach(o => {
          if (o) result.Occasion[o] = (result.Occasion[o] || 0) + 1;
        });
      }

      // Price range counts
      if (p.price != null) {
        if (p.price < 1000) result.Price['Under ₹1000'] = (result.Price['Under ₹1000'] || 0) + 1;
        if (p.price >= 1000 && p.price <= 2000) result.Price['₹1000 - ₹2000'] = (result.Price['₹1000 - ₹2000'] || 0) + 1;
        if (p.price >= 2000 && p.price <= 3000) result.Price['₹2000 - ₹3000'] = (result.Price['₹2000 - ₹3000'] || 0) + 1;
        if (p.price > 3000) result.Price['Above ₹3000'] = (result.Price['Above ₹3000'] || 0) + 1;
      }
    });

    return result;
  }, [products]);

  /* ── Toggle a filter value ── */
  const toggleFilter = (section, value) => {
    const current = activeFilters[section] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...activeFilters, [section]: updated });
  };

  /* ── Clear all filters ── */
  const clearAll = () => {
    onFilterChange({
      Colour: [],
      Type: [],
      Price: [],
      Occasion: [],
      Category: [],
    });
  };

  /* ── Total selected count ── */
  const totalSelected = Object.values(activeFilters).reduce(
    (sum, arr) => sum + (arr?.length || 0), 0
  );

  /* ── Filter options by search term ── */
  const filterBySearch = (options, sectionKey) => {
    const term = searchTerms[sectionKey]?.toLowerCase() || '';
    if (!term) return options;
    return options.filter(opt => opt.toLowerCase().includes(term));
  };

  /* ── Render a searchable filter section ── */
  const renderFilterSection = (title, sectionKey, options, showSearch = false) => {
    const filtered = filterBySearch(options, sectionKey);
    return (
      <FilterSection
        title={title}
        selectedCount={activeFilters[sectionKey]?.length || 0}
        defaultOpen={activeFilters[sectionKey]?.length > 0}
      >
        {/* Mini search within section */}
        {showSearch && options.length > 5 && (
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#BBB]" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}`}
              value={searchTerms[sectionKey] || ''}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, [sectionKey]: e.target.value }))}
              className="w-full pl-8 pr-3 py-[7px] text-[12px] bg-[#F8F8F8] border border-[#EBEBEB] rounded-lg outline-none focus:border-[#A56D7A]/40 focus:bg-white transition-all placeholder:text-[#BBB]"
            />
          </div>
        )}
        <div className="space-y-0.5">
          {filtered.map(option => (
            <CheckboxItem
              key={option}
              label={option}
              checked={activeFilters[sectionKey]?.includes(option) || false}
              onChange={() => toggleFilter(sectionKey, option)}
              count={counts[sectionKey]?.[option]}
              colorSwatch={sectionKey === 'Colour' ? COLOUR_SWATCHES[option] : null}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-[11px] text-[#BBB] italic py-2 px-2">No matches found</p>
          )}
        </div>
      </FilterSection>
    );
  };

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#F0EDED] h-full">
      {/* ── Sidebar Header ── */}
      <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-[#F0EDED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-[0.08em]">
            Filters
          </h2>
          {totalSelected > 0 && (
            <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-[#FFF8F3] text-[#A56D7A] text-[10px] rounded-full font-bold px-1.5 border border-[#A56D7A]/20">
              {totalSelected}
            </span>
          )}
        </div>
        {totalSelected > 0 && (
          <button
            onClick={clearAll}
            className="text-[12px] text-[#A56D7A] font-semibold hover:text-[#935b67] transition-colors uppercase tracking-wide"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Filter Sections ── */}
      {renderFilterSection('Category', 'Category', categoryOptions, true)}
      {renderFilterSection('Price', 'Price', PRICE_OPTIONS)}
      {renderFilterSection('Colour', 'Colour', COLOUR_OPTIONS, true)}
      {renderFilterSection('Type', 'Type', TYPE_OPTIONS)}
      {renderFilterSection('Occasion', 'Occasion', OCCASION_OPTIONS)}

      {/* Bottom padding */}
      <div className="h-6" />
    </aside>
  );
};

export default FilterSidebar;
