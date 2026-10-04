import React from 'react';

const OCCASION_OPTIONS = ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'];
const PRICE_OPTIONS = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const COLOR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const STONE_COLOR_OPT = ['Clear', 'Blue', 'Pink', 'Red', 'Green', 'Yellow', 'White', 'Gold', 'Various', 'Orange', 'Black', 'Purple'];
const STONE_OPTIONS = ['Crystal', 'Sapphire', 'Pink Morganite', 'Ruby', 'Emerald', 'Pearl', 'Moissanite Stone', 'AD Stone', 'Kundan', 'Polki Stone', 'Polki Diamond'];

const FilterIcon = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="16" height="1.5" fill="#000" />
    <rect x="2" y="4.25" width="12" height="1.5" fill="#000" />
    <rect x="5" y="8.5" width="6" height="1.5" fill="#000" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
    <path d="M1 1l6 6 6-6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="shop-filter-section">
      <button className="shop-filter-head" onClick={onToggle}>
        <span className="shop-filter-head-text">{title}</span>
        <span className={`shop-filter-arrow${open ? ' open' : ''}`}><ChevronIcon /></span>
      </button>
      {open && <div className="shop-filter-items">{children}</div>}
    </div>
  );
}

function FilterItem({ label, checked, onToggle }) {
  return (
    <label className="shop-filter-item" onClick={onToggle}>
      <span className={`shop-filter-cb${checked ? ' checked' : ''}`}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="shop-filter-item-text">{label}</span>
    </label>
  );
}

export default function ShopFilterSidebar({
  open,
  setOpen,
  activeFilters,
  toggle,
  categoryOptions,
  typeOptions
}) {
  return (
    <aside className="shop-filter-panel">
      <div className="shop-filter-header">
        <FilterIcon />
        <span className="shop-topbar-filter-label">Filter</span>
      </div>

      {/* CATEGORY */}
      <FilterSection title="Category" open={open.Category} onToggle={() => setOpen(o => ({ ...o, Category: !o.Category }))}>
        {categoryOptions.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.Category.includes(opt)}
            onToggle={() => toggle('Category', opt)}
          />
        ))}
      </FilterSection>

      {/* JEWELLERY TYPE */}
      <FilterSection title="Jewellery Type" open={open.Type} onToggle={() => setOpen(o => ({ ...o, Type: !o.Type }))}>
        {typeOptions.map(opt => {
          if (opt.toLowerCase() === 'accessories') {
            return (
              <div key={opt} className="mb-2">
                <div className="flex items-center justify-between">
                  <FilterItem
                    label={opt}
                    checked={activeFilters.Type.includes(opt)}
                    onToggle={() => toggle('Type', opt)}
                  />
                  <button 
                    onClick={() => setOpen(o => ({ ...o, AccessoryTypes: !o.AccessoryTypes }))}
                    className="p-1 focus:outline-none"
                  >
                    <svg className={`transform transition-transform ${open.AccessoryTypes ? 'rotate-180' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {open.AccessoryTypes && (
                  <div style={{ marginLeft: '29px' }} className="flex flex-col">
                    {['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories', 'Bracelet', 'Others'].map(sub => (
                      <FilterItem
                        key={sub}
                        label={sub.toUpperCase()}
                        checked={activeFilters.AccessoryType?.includes(sub)}
                        onToggle={() => toggle('AccessoryType', sub)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <FilterItem
              key={opt}
              label={opt}
              checked={activeFilters.Type.includes(opt)}
              onToggle={() => toggle('Type', opt)}
            />
          );
        })}
      </FilterSection>

      {/* OCCASION */}
      <FilterSection title="Occasion" open={open.Occasion} onToggle={() => setOpen(o => ({ ...o, Occasion: !o.Occasion }))}>
        {OCCASION_OPTIONS.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.Occasion.includes(opt)}
            onToggle={() => toggle('Occasion', opt)}
          />
        ))}
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="Price" open={open.Price} onToggle={() => setOpen(o => ({ ...o, Price: !o.Price }))}>
        {PRICE_OPTIONS.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.Price.includes(opt)}
            onToggle={() => toggle('Price', opt)}
          />
        ))}
      </FilterSection>

      {/* COLOR */}
      <FilterSection title="Color" open={open.Colour} onToggle={() => setOpen(o => ({ ...o, Colour: !o.Colour }))}>
        {COLOR_OPTIONS.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.Colour.includes(opt)}
            onToggle={() => toggle('Colour', opt)}
          />
        ))}
      </FilterSection>

      {/* STONE COLOR */}
      <FilterSection title="Stone Color" open={open.StoneColour} onToggle={() => setOpen(o => ({ ...o, StoneColour: !o.StoneColour }))}>
        {STONE_COLOR_OPT.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.StoneColour.includes(opt)}
            onToggle={() => toggle('StoneColour', opt)}
          />
        ))}
      </FilterSection>

      {/* STONE */}
      <FilterSection title="Stone" open={open.Stone} onToggle={() => setOpen(o => ({ ...o, Stone: !o.Stone }))}>
        {STONE_OPTIONS.map(opt => (
          <FilterItem
            key={opt}
            label={opt}
            checked={activeFilters.Stone.includes(opt)}
            onToggle={() => toggle('Stone', opt)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}
