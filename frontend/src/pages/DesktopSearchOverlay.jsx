import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apilaLogo from '../assets/Apila Logo01.svg';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import '../styles/ApilaJewels.css';

/* ── Figma 524:1413 — Desktop Search Overlay ── */

/* Module-level memory cache — survives overlay close/reopen within the same page session */
let jewelsMemCache = null;
const CACHE_KEY = 'apila_srch_jewels';

const SUGGESTIONS = [
  { label: 'victorian-moissinate', slug: 'victorian-moissinate' },
  { label: 'AD Jewels',          slug: 'ad-jewels' },
  { label: 'Gold Antique Jewels',slug: 'gold-antique-jewels' },
  { label: 'Kundan Jewels',      slug: 'kundan-jewels' },
];

function ProductCard({ product, onClose }) {
  const navigate = useNavigate();
  const rawImg = product.images?.[0];
  const imgUrl = rawImg?.url || (typeof rawImg === 'string' ? rawImg : '') || product.media?.[0]?.url || '';
  const optimized = imgUrl ? getOptimizedCloudinaryUrl(imgUrl, { width: 190, height: 190 }) : '';
  const category = Array.isArray(product.category)
    ? product.category[0]
    : (product.category || '');

  return (
    <div className="srch-product-card">
      <div
        className="srch-product-thumb"
        onClick={() => { onClose(); navigate(`/shop/${product._id}`); }}
      >
        {imgUrl ? (
          <img src={optimized} alt={product.name} loading="lazy" />
        ) : (
          <div className="srch-product-placeholder" />
        )}
      </div>
      <div className="srch-product-info">
        <p className="srch-product-name">{category}</p>
        <p className="srch-product-desc">{product.name}</p>
        <Link
          to={`/shop/${product._id}`}
          className="srch-product-details"
          onClick={onClose}
        >
          Details
        </Link>
      </div>
    </div>
  );
}

function isAccessory(product) {
  if (!product) return false;
  const types = Array.isArray(product.type) ? product.type : (product.type ? [product.type] : []);
  const categories = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
  const hasAccessoryType = Boolean(product.accessoryType);

  return (
    hasAccessoryType ||
    types.some(t => t?.toLowerCase() === 'accessories') ||
    categories.some(c => c?.toLowerCase() === 'accessories')
  );
}

export default function DesktopSearchOverlay({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [defaultProducts, setDefaultProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* auto-focus + body scroll lock */
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Premium Jewels — stale-while-revalidate:
     1. Show memory cache instantly (same session)
     2. Fall back to localStorage cache (across refreshes)
     3. Always fetch fresh data in background, update both caches */
  useEffect(() => {
    /* Step 1: show cached data immediately (excluding accessories) */
    if (jewelsMemCache) {
      const filteredMem = jewelsMemCache.filter(item => !isAccessory(item));
      setDefaultProducts(filteredMem);
    } else {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const filteredStored = parsed.filter(item => !isAccessory(item));
          jewelsMemCache = filteredStored;
          setDefaultProducts(filteredStored);
        }
      } catch {}
    }

    /* Step 2: fetch fresh random items in background, update cache + display */
    async function refresh() {
      try {
        const page = Math.floor(Math.random() * 4) + 1;
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=20&page=${page}`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.products || data.data || []);
        if (list.length === 0) {
          const fb = await fetch(`${API_BASE_URL}/api/jewellery?limit=20`);
          const fbData = await fb.json();
          list = Array.isArray(fbData) ? fbData : (fbData.products || fbData.data || []);
        }
        const nonAccessories = list.filter(item => !isAccessory(item)).slice(0, 4);
        if (nonAccessories.length > 0) {
          jewelsMemCache = nonAccessories;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(nonAccessories)); } catch {}
          setDefaultProducts(nonAccessories);
        }
      } catch {}
    }
    refresh();
  }, []);

  /* debounced search */
  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/jewellery?search=${encodeURIComponent(query.trim())}&limit=4`
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || data.data || []);
        setResults(list.slice(0, 4));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  }, [query, onClose, navigate]);

  const isSearching  = query.trim().length > 0;
  const displayList  = isSearching ? results : defaultProducts;
  const sectionLabel = isSearching
    ? (loading ? 'Searching…' : results.length ? 'Results' : `No results for "${query}"`)
    : 'Premium Jewels';

  return (
    <div className="srch-overlay" role="dialog" aria-modal="true" aria-label="Search">

      {/* ── White panel ── */}
      <div className="srch-panel">

        {/* ── Topbar ── */}
        <div className="srch-topbar">

          {/* Search field */}
          <div className="srch-field">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,0,0,0.45)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              className="srch-input"
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>

          {/* Logo */}
          <div className="srch-logo" onClick={() => { onClose(); navigate('/'); }}>
            <img src={apilaLogo} alt="Apila Jewels" className="nav-logo-img" />
          </div>

          {/* Right nav icons */}
          <div className="srch-nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist"
              onClick={() => { onClose(); navigate('/wishlist'); }}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Cart"
              onClick={() => { onClose(); navigate('/cart'); }}>
              <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
                <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account"
              onClick={() => { onClose(); navigate('/profile'); }}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Topbar bottom divider — matches navbar line at y=92 */}
        <div className="srch-divider" />

        {/* ── Two-column content area ── */}
        <div className="srch-content">

          {/* Left: category suggestions */}
          <div className="srch-left">
            <p className="srch-section-label">Suggestions</p>
            <ul className="srch-suggestion-list">
              {SUGGESTIONS.map(item => (
                <li key={item.slug}>
                  <Link
                    to={`/shop?category=${item.slug}`}
                    className="srch-suggestion-link"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="srch-left-spacer" />
            <span
              className="srch-suggestion-link srch-connect-link"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                onClose();
                if (window.location.pathname === '/') {
                  document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/', { state: { scrollTo: 'footer-contact' } });
                }
              }}
            >
              Connect us
            </span>
          </div>

          {/* Right: product results */}
          <div className="srch-right">
            <p className="srch-section-label srch-results-label">{sectionLabel}</p>

            {displayList.length > 0 && (
              <div className="srch-results-grid">
                {/* Row 1 */}
                <div className="srch-results-row">
                  {displayList.slice(0, 2).map((p, i) => (
                    <ProductCard key={p._id || i} product={p} onClose={onClose} />
                  ))}
                </div>

                {/* Row 2 */}
                {displayList.slice(2, 4).length > 0 && (
                  <div className="srch-results-row">
                    {displayList.slice(2, 4).map((p, i) => (
                      <ProductCard key={p._id || `r2-${i}`} product={p} onClose={onClose} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Dark backdrop — click to close */}
      <div className="srch-backdrop" onClick={onClose} />
    </div>
  );
}
