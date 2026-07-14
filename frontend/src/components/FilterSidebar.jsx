import React, { useState, useMemo, useContext } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CategoryContext from '../context/CategoryContext';

/* ── Filter options ── */
const JEWELLERY_TYPE_OPTIONS = ['Choker & Necklace', 'Long Haram', 'Semi Bridal & Combo Sets', 'Full Bridal Set', 'Accessories'];
const COLOUR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const PRICE_OPTIONS = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const OCCASION_OPTIONS = ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'];
const STONE_OPTIONS = ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Polki Diamond", "Rose Quartz", "Green Onyx"];
const STONE_COLOUR_OPTIONS = ["Clear", "Blue", "Pink", "Red", "Green", "Yellow", "White", "Gold", "Various", "Violete", "Orange", "Black", "Purple", "Silver"];

/* ── Collapsible filter section ── */
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #EBEBEB' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: 'var(--f-gotham-b, sans-serif)',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#1A1A1A',
        }}>
          {title}
        </span>
        {isOpen
          ? <ChevronUp size={15} color="#888" />
          : <ChevronDown size={15} color="#888" />
        }
      </button>

      {isOpen && (
        <div style={{ padding: '0 20px 12px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ── Checkbox item ── */
const CheckboxItem = ({ label, checked, onChange }) => (
  <label style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 0',
    cursor: 'pointer',
  }}>
    {/* Custom checkbox */}
    <div style={{
      width: '14px',
      height: '14px',
      borderRadius: '2px',
      border: checked ? '1.5px solid #2563EB' : '1.5px solid #AAAAAA',
      background: checked ? '#2563EB' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.15s ease',
    }}>
      {checked && (
        <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>

    <span style={{
      fontFamily: 'var(--f-gotham-b, sans-serif)',
      fontSize: '11px',
      fontWeight: checked ? '600' : 'normal',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: checked ? '#2563EB' : '#1A1A1A',
      transition: 'color 0.15s ease',
      textDecoration: checked ? 'underline' : 'none',
    }}>
      {label}
    </span>

    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
  </label>
);


/* ═══════════════════════════════════════════════
   FilterSidebar — desktop left panel
   ═══════════════════════════════════════════════ */
const FilterSidebar = ({ activeFilters, onFilterChange, products = [] }) => {
  const { categories } = useContext(CategoryContext);

  const categoryOptions = useMemo(() => categories.map(c => c.name), [categories]);

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
      StoneName: [],
      StoneColour: [],
    });
  };

  /* ── Total selected count ── */
  const totalSelected = Object.values(activeFilters).reduce(
    (sum, arr) => sum + (arr?.length || 0), 0
  );

  /* ── Render a filter section ── */
  const renderSection = (title, sectionKey, options, defaultOpen = false) => (
    <FilterSection title={title} defaultOpen={defaultOpen || (activeFilters[sectionKey]?.length > 0)}>
      <div>
        {options.map(option => (
          <CheckboxItem
            key={option}
            label={option}
            checked={activeFilters[sectionKey]?.includes(option) || false}
            onChange={() => toggleFilter(sectionKey, option)}
          />
        ))}
      </div>
    </FilterSection>
  );

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #EBEBEB',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #EBEBEB',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Filter icon */}
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M1 1h12M3 6h8M5 11h4" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{
            fontFamily: 'var(--f-gotham-b, sans-serif)',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#1A1A1A',
          }}>
            Filter
          </span>
        </div>
        {totalSelected > 0 && (
          <button
            onClick={clearAll}
            style={{
              fontFamily: 'var(--f-gotham-b, sans-serif)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#A56D7A',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Filter Sections ── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {renderSection('Category', 'Category', categoryOptions, true)}
        {renderSection('Jewellery Type', 'Type', JEWELLERY_TYPE_OPTIONS, true)}
        {renderSection('Occasion', 'Occasion', OCCASION_OPTIONS, true)}
        {renderSection('Price', 'Price', PRICE_OPTIONS)}
        {renderSection('Color', 'Colour', COLOUR_OPTIONS)}
        {renderSection('Stone Color', 'StoneColour', STONE_COLOUR_OPTIONS)}
        {renderSection('Stone', 'StoneName', STONE_OPTIONS)}
        <div style={{ height: '24px' }} />
      </div>
    </aside>
  );
};

export default FilterSidebar;
