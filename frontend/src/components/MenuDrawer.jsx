import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import iconCall from '../assets/icons/call.svg';

const CATEGORY_ITEMS = [
  { label: 'Victorian & Moissinate', slug: 'victorian-moissinate' },
  { label: 'AD Jewels', slug: 'ad-jewels' },
  { label: 'Gold Antique Jewels', slug: 'gold-antique-jewels' },
  { label: 'Kundan Jewels', slug: 'kundan-jewels' },
];

const TYPE_ITEMS = [
  { label: 'Choker & Necklace', slug: 'choker-necklace' },
  { label: 'Long Haram', slug: 'long-haram' },
  { label: 'Semi Bridal & Combo Sets', slug: 'semi-bridal' },
  { label: 'Full Bridal Set', slug: 'full-bridal' },
  { label: 'Bangles', slug: 'bangles-bracelets' },
  { label: 'Accessories', slug: 'accessories' },
];

const OCCASION_ITEMS = [
  { label: 'Bridal Set', slug: 'bridal' },
  { label: 'Bridesmaid', slug: 'bridesmaid' },
  { label: 'Designer Collection', slug: 'designer' },
  { label: 'Reception Jewels', slug: 'reception' },
  { label: 'Party Wear', slug: 'party' },
  { label: 'Small Jewels', slug: 'small' },
];

export default function MenuDrawer({ menuOpen, onClose }) {
  const navigate = useNavigate();

  return (
    <div className={`menu-overlay${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="menu-panel">

        {/* Topbar: close button + search bar */}
        <div className="menu-topbar">
          <button className="menu-close-btn" onClick={onClose} aria-label="Close menu">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <div className="menu-searchbar" onClick={() => { onClose(); navigate('/shop'); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="menu-search-placeholder">Search</span>
          </div>
        </div>

        {/* Scrollable nav area */}
        <div className="menu-nav-scroll">
          <span className="menu-section-heading">Category</span>
          <ul className="menu-section menu-section--first">
            {CATEGORY_ITEMS.map(item => (
              <li key={item.slug} className="menu-item">
                <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={onClose}>
                  {item.label}
                </Link>
                <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                  <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
            ))}
          </ul>

          <hr className="menu-rule" />

          <span className="menu-section-heading">Jewellery Type</span>
          <ul className="menu-section">
            {TYPE_ITEMS.map(item => (
              <li key={item.slug} className="menu-item">
                <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={onClose}>
                  {item.label}
                </Link>
                <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                  <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
            ))}
          </ul>

          <hr className="menu-rule" />

          <span className="menu-section-heading">Occasion</span>
          <ul className="menu-section">
            {OCCASION_ITEMS.map(item => (
              <li key={item.slug} className="menu-item">
                <Link to={`/shop?occasion=${item.slug}`} className="menu-item-link" onClick={onClose}>
                  {item.label}
                </Link>
                <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                  <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div className="menu-contact">
          <p className="menu-contact-heading">Contact Us</p>
          <hr className="menu-rule menu-rule--contact" />
          <a href="tel:+917397721101" className="menu-contact-row">
            <img src={iconCall} width="14" height="14" alt="" />
            <span>+91 73977 21101</span>
          </a>
        </div>

      </div>
    </div>
  );
}
