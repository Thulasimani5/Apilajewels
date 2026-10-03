import React, { useState } from 'react';

export default function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pdp-accordion">
      <button className="pdp-accordion-btn" onClick={() => setOpen(o => !o)}>
        <span className="pdp-accordion-title">{title}</span>
        <span className={`pdp-accordion-arrow${open ? ' open' : ''}`}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && <div className="pdp-accordion-body">{children}</div>}
    </div>
  );
}
