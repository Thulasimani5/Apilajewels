import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import apilaLogo from '../assets/Apila Logo01.svg';

const CATEGORIES = [
  { label: 'Moissinate Jewels', slug: 'moissinate-jewels' },
  { label: 'AD Jewels', slug: 'ad-jewels' },
  { label: 'Gold Antique Jewels', slug: 'gold-antique-jewels' },
  { label: 'Kundan Jewels', slug: 'kundan-jewels' },
  { label: 'AD Bangles', slug: 'ad-bangles' },
  { label: 'Gold Bangles', slug: 'gold-bangles' },
  { label: 'Accessories', slug: 'accessories' },
];

export default function DesktopSearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-focus input when overlay opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Fetch search results with debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?search=${encodeURIComponent(query.trim())}&limit=4`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || data.products || []);
        setResults(list.slice(0, 4).map(item => {
          const rawImg = item.images?.[0];
          const imgUrl = rawImg?.url || rawImg?.secure_url
            || (typeof rawImg === 'string' && rawImg.startsWith('http') ? rawImg : '')
            || '';
          const price = (item.rentalPrice || 0) >= 2000
            ? 'Price on Request'
            : `₹${item.rentalPrice || 0}`;
          return { id: item._id, name: item.name || '', desc: item.description || item.material || '', price, img: imgUrl };
        }));
      } catch (err) {
        console.error('Search fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [query]);

  const goTo = (path) => { onClose(); navigate(path); };

  // Split results into two rows of 2
  const row1 = results.slice(0, 2);
  const row2 = results.slice(2, 4);

  const NavIcons = {
    heart: (
      <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
        <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887Z" fill="currentColor"/>
      </svg>
    ),
    cart: (
      <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
        <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    account: (
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
        <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const ProductCard = ({ item }) => (
    <div className="srch-product-card" onClick={() => goTo(`/shop/${item.id}`)} style={{ cursor: 'pointer' }}>
      <div className="srch-product-thumb">
        {item.img
          ? <img src={item.img} alt={item.name} />
          : <div className="srch-product-placeholder" />}
      </div>
      <div className="srch-product-info">
        <p className="srch-product-name">{item.name}</p>
        <p className="srch-product-desc">{item.desc}</p>
        <span
          className="srch-product-details"
          onClick={(e) => { e.stopPropagation(); goTo(`/shop/${item.id}`); }}
        >
          Details
        </span>
      </div>
    </div>
  );

  return (
    <div className="srch-overlay">
      {/* White panel */}
      <div className="srch-panel">
        {/* Topbar */}
        <div className="srch-topbar">
          {/* Search field */}
          <div className="srch-field">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              className="srch-input"
              placeholder="Search jewellery…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  goTo(`/shop?search=${encodeURIComponent(query.trim())}`);
                }
              }}
            />
          </div>

          {/* Centred logo */}
          <div className="srch-logo" onClick={() => goTo('/')}>
            <img src={apilaLogo} alt="Apila Jewels" style={{ height: '38px' }} />
          </div>

          {/* Right nav icons */}
          <div className="srch-nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => goTo('/wishlist')}>{NavIcons.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => goTo('/cart')}>{NavIcons.cart}</button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => goTo('/login')}>{NavIcons.account}</button>
          </div>
        </div>

        {/* Divider */}
        <div className="srch-divider" />

        {/* Two-column content */}
        <div className="srch-content">
          {/* Left: category suggestions */}
          <div className="srch-left">
            <p className="srch-section-label">Categories</p>
            <ul className="srch-suggestion-list">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <span
                    className="srch-suggestion-link"
                    onClick={() => goTo(`/shop?category=${cat.slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {cat.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="srch-left-spacer" />
            <span
              className="srch-suggestion-link srch-connect-link"
              onClick={() => goTo('/?scrollTo=footer-contact')}
              style={{ cursor: 'pointer' }}
            >
              Connect Us
            </span>
          </div>

          {/* Right: search results */}
          <div className="srch-right">
            {query.trim() && (
              <>
                <p className="srch-section-label srch-results-label">
                  {loading ? 'Searching…' : results.length > 0 ? `Results for "${query}"` : `No results for "${query}"`}
                </p>
                {results.length > 0 && (
                  <div className="srch-results-grid">
                    {row1.length > 0 && (
                      <div className="srch-results-row">
                        {row1.map((item) => <ProductCard key={item.id} item={item} />)}
                      </div>
                    )}
                    {row2.length > 0 && (
                      <div className="srch-results-row">
                        {row2.map((item) => <ProductCard key={item.id} item={item} />)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {!query.trim() && (
              <p className="srch-section-label">Start typing to search…</p>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop — click to close */}
      <div className="srch-backdrop" onClick={onClose} />
    </div>
  );
}
