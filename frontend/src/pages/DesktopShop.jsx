import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import CategoryContext from '../context/CategoryContext';
import { useAllProducts } from '../hooks/useProducts';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import '../styles/ApilaJewels.css';

/* ── Filter data ── */
const OCCASION_OPTIONS = ['Bridal Set', 'Bridesmaid', 'Designer Collection', 'Reception Jewels', 'Party Wear', 'Small Jewels'];
const PRICE_OPTIONS    = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const COLOR_OPTIONS    = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const STONE_COLOR_OPT  = ['Clear', 'Blue', 'Pink', 'Red', 'Green', 'Yellow', 'White', 'Gold', 'Various', 'Orange', 'Black', 'Purple'];
const STONE_OPTIONS    = ['Crystal', 'Sapphire', 'Pink Morganite', 'Ruby', 'Emerald', 'Pearl', 'Moissanite Stone', 'AD Stone', 'Kundan', 'Polki Stone'];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest',      label: 'Newest First' },
  { id: 'price_asc',  label: 'Low Price' },
  { id: 'price_desc', label: 'High Price' },
  { id: 'popularity', label: 'Popularity' },
];

const ITEMS_PER_PAGE = 12;

/* ── Funnel icon ── */
const FilterIcon = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="0"  y="0"    width="16" height="1.5" fill="#000"/>
    <rect x="2"  y="4.25" width="12" height="1.5" fill="#000"/>
    <rect x="5"  y="8.5"  width="6"  height="1.5" fill="#000"/>
  </svg>
);

/* ── Chevron ── */
const ChevronIcon = () => (
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" aria-hidden="true">
    <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Collapsible filter section ── */
function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="shop-filter-section">
      <button className="shop-filter-head" onClick={onToggle}>
        <span className="shop-filter-head-text">{title}</span>
        <span className={`shop-filter-arrow${open ? ' open' : ''}`}><ChevronIcon/></span>
      </button>
      {open && <div className="shop-filter-items">{children}</div>}
    </div>
  );
}

/* ── Checkbox row ── */
function FilterItem({ label, checked, onToggle }) {
  return (
    <label className="shop-filter-item" onClick={onToggle}>
      <span className={`shop-filter-cb${checked ? ' checked' : ''}`}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="shop-filter-item-text">{label}</span>
    </label>
  );
}

/* ── Product card ── */
function ShopCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const price  = product.rentalPrice || product.price || 0;
  const priceText = price >= 2000 ? 'Premium Collection' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

  return (
    <Link to={`/shop/${product._id}`} className="shop-card">
      <div className="shop-card-img-wrap">
        <img
          className="shop-card-img"
          src={getOptimizedCloudinaryUrl(imgUrl, { width: 390, height: 440 })}
          alt={product.name}
          loading="lazy"
        />
        <button
          className={`shop-card-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            if (!user) navigate('/login');
            else toggleWishlist(product);
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24"
            fill={liked ? '#ab6281' : 'none'}
            stroke={liked ? '#ab6281' : 'currentColor'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <p className="shop-card-name">{product.name}</p>
      <p className="shop-card-desc">{category || 'Jewels'}</p>
      <p className="shop-card-price">{priceText}</p>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   DesktopShop — pixel-perfect Figma 263:1322
   ══════════════════════════════════════════════════════ */
export default function DesktopShop() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { categories }  = useContext(CategoryContext);
  const { user }        = useAuth();

  /* ── Active filter state ── */
  const EMPTY_FILTERS = { Category: [], Occasion: [], Price: [], Colour: [], StoneColour: [], Stone: [] };
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  /* ── Section open/closed state ── */
  const [open, setOpen] = useState({
    Category: true, Occasion: true,
    Price: false, Colour: false, StoneColour: false, Stone: false,
  });

  /* ── Sort + pagination ── */
  const [activeSort, setActiveSort] = useState('recommended');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const sortRef = useRef(null);

  /* ── Navbar hide on scroll-down ── */
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      setNavHidden(y > lastY && y > 80);
      lastY = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Initialise Category filter from URL ── */
  useEffect(() => {
    const cat = searchParams.get('category');
    if (!cat || !categories.length) return;
    const norm = cat.toLowerCase();
    const matched = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === norm);
    const name = matched?.name
      || (norm === 'moissanite' ? 'Moissanite' : null)
      || (norm.includes('temple') ? 'Temple Jewellery' : null)
      || (norm === 'kundan' ? 'Kundan' : null)
      || (norm.includes('ad') ? 'AD Jewellery' : null)
      || cat;
    setActiveFilters(f => ({ ...f, Category: [name] }));
  }, [searchParams, categories]);

  /* ── Data ── */
  const { data: productsData, isLoading, isError, error } = useAllProducts();
  const products = productsData?.data || [];

  const categoryOptions = useMemo(() => categories.map(c => c.name), [categories]);

  /* ── Toggle filter ── */
  const toggle = (section, value) => {
    setActiveFilters(f => {
      const cur = f[section] || [];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...f, [section]: next };
    });
    setPage(1);
  };

  /* ── Filter products ── */
  const filtered = useMemo(() => products.filter(p => {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    if (activeFilters.Category.length > 0 &&
        !activeFilters.Category.some(c => cats.some(pc => pc?.toLowerCase() === c.toLowerCase()))) return false;

    const occ = Array.isArray(p.occasion) ? p.occasion : [p.occasion];
    if (activeFilters.Occasion.length > 0 &&
        !activeFilters.Occasion.some(o => occ.some(po => po?.toLowerCase() === o.toLowerCase()))) return false;

    const cols = Array.isArray(p.colour) ? p.colour : [p.colour];
    if (activeFilters.Colour.length > 0 &&
        !activeFilters.Colour.some(c => cols.some(pc => pc?.toLowerCase() === c.toLowerCase()))) return false;

    if (activeFilters.Price.length > 0) {
      const pr = p.rentalPrice || p.price || 0;
      const match = activeFilters.Price.some(r => {
        if (r === 'Under ₹1000')       return pr < 1000;
        if (r === '₹1000 - ₹2000')     return pr >= 1000 && pr <= 2000;
        if (r === '₹2000 - ₹3000')     return pr >= 2000 && pr <= 3000;
        if (r === 'Above ₹3000')        return pr > 3000;
        return true;
      });
      if (!match) return false;
    }

    const stones = Array.isArray(p.stoneName) ? p.stoneName : [p.stoneName];
    if (activeFilters.Stone.length > 0 &&
        !activeFilters.Stone.some(s => stones.some(ps => ps?.toLowerCase() === s.toLowerCase()))) return false;

    const sc = Array.isArray(p.stoneColour) ? p.stoneColour : [p.stoneColour];
    if (activeFilters.StoneColour.length > 0 &&
        !activeFilters.StoneColour.some(c => sc.some(ps => ps?.toLowerCase() === c.toLowerCase()))) return false;

    return true;
  }), [products, activeFilters]);

  /* ── Sort ── */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (activeSort === 'newest')     return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeSort === 'price_asc')  return arr.sort((a, b) => (a.rentalPrice || a.price || 0) - (b.rentalPrice || b.price || 0));
    if (activeSort === 'price_desc') return arr.sort((a, b) => (b.rentalPrice || b.price || 0) - (a.rentalPrice || a.price || 0));
    if (activeSort === 'popularity') return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return arr;
  }, [filtered, activeSort]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated  = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* ── Breadcrumb header label ── */
  const headerTitle = useMemo(() => {
    if (activeFilters.Category.length) return activeFilters.Category.join(', ');
    if (activeFilters.Occasion.length) return activeFilters.Occasion.join(', ');
    return 'All Jewels';
  }, [activeFilters]);

  /* ── Current sort label ── */
  const sortLabel = SORT_OPTIONS.find(o => o.id === activeSort)?.label || 'Recommended';

  /* ── Close sort menu on outside click ── */
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortMenuOpen(false); };
    if (sortMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortMenuOpen]);

  /* ── Clear all ── */
  const clearAll = () => { setActiveFilters(EMPTY_FILTERS); setPage(1); };

  const navIcons = {
    search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    heart:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    cart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    acct:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    menu:   null,
  };

  return (
    <div className="apila">

      {/* ── NAVBAR ── */}
      <header>
        <nav className={`navbar scrolled${navHidden ? ' nav-hidden' : ''}`}>
          <div className="nav-left">
            <div className="nav-hamburger" role="button" tabIndex={0}>
              <span/><span/><span/>
            </div>
            <div className="nav-search" role="button" tabIndex={0} onClick={() => navigate('/shop')}>
              {navIcons.search}<span>Search</span>
            </div>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels"/>
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>{navIcons.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart"     onClick={() => navigate('/cart')}>{navIcons.cart}</button>
            <button className="nav-icon-btn" aria-label="Account"  onClick={() => navigate('/login')}>{navIcons.acct}</button>
          </div>
        </nav>
      </header>

      {/* ── TOPBAR: FILTER | breadcrumb + sort ── */}
      <div className="shop-topbar">
        {/* Left: funnel + FILTER label */}
        <div className="shop-topbar-left">
          <FilterIcon/>
          <span className="shop-topbar-filter-label">Filter</span>
        </div>

        {/* Right: breadcrumb + sort */}
        <div className="shop-topbar-right">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="shop-bc-home">Home</Link>
            <span className="shop-bc-sep" aria-hidden="true"/>
            <span className="shop-bc-current">{headerTitle}</span>
          </nav>

          {/* Sort dropdown */}
          <div className="shop-sort-wrap" ref={sortRef}>
            <button className="shop-sort-btn" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
              <span className="shop-sort-label">Sort by : </span>
              <span className="shop-sort-value">{sortLabel}</span>
              <span className={`shop-sort-chevron${sortMenuOpen ? ' open' : ''}`}>
                <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                  <path d="M1 1l2.5 2.5L6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
            </button>
            {sortMenuOpen && (
              <div className="shop-sort-menu">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`shop-sort-item${activeSort === opt.id ? ' active' : ''}`}
                    onClick={() => { setActiveSort(opt.id); setSortMenuOpen(false); setPage(1); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="shop-body">

        {/* ── LEFT FILTER PANEL ── */}
        <aside className="shop-filter-panel">

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

        {/* ── RIGHT PRODUCT AREA ── */}
        <div className="shop-content">

          {/* Item count + clear */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="shop-count">{sorted.length} {sorted.length === 1 ? 'item' : 'items'}</p>
            {Object.values(activeFilters).some(v => v.length > 0) && (
              <button className="shop-clear-btn" onClick={clearAll}>Clear All</button>
            )}
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="shop-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="shop-card-skeleton">
                  <div className="shop-card-img-skel"/>
                  <div className="shop-card-txt-skel"/>
                  <div className="shop-card-txt-skel"/>
                  <div className="shop-card-txt-skel short"/>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="shop-error">{error?.message || 'Failed to load products'}</div>
          ) : sorted.length === 0 ? (
            <div className="shop-empty">
              <p>No matching jewellery found</p>
              <button className="shop-clear-btn" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {paginated.map(p => <ShopCard key={p._id} product={p}/>)}
            </div>
          )}

          {/* Pagination: < 1 2 3 > */}
          {totalPages > 1 && (
            <div className="shop-pagination">
              {page > 1 && (
                <button className="shop-pag-btn" onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}>
                  &lt;
                </button>
              )}
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    className={`shop-pag-num${page === n ? ' active' : ''}`}
                    onClick={() => { setPage(n); window.scrollTo(0, 0); }}
                  >
                    {n}
                  </button>
                );
              })}
              {page < totalPages && (
                <button className="shop-pag-btn" onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}>
                  &gt;
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=moissanite">Moissinate Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=antique">Gold Antique Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan">Kundan Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=bangles">Bangles</Link>
          </div>
          <div>
            <span className="footer-col-head">Support</span>
            <Link className="footer-link-lg" to="/rental-policy">Delivery &amp; Pickup</Link>
            <Link className="footer-link-lg" to="/terms">Rental Terms</Link>
            <Link className="footer-link-lg" to="/faqs">FAQ</Link>
            <Link className="footer-link-lg" to="/care">Care Instructions</Link>
            <Link className="footer-link-lg" to="/contact">Contact Us</Link>
          </div>
          <div>
            <span className="footer-col-head">Contact</span>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="footer-contact-text">+91 73977 21122</span>
            </div>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className="footer-contact-text">apila.jewels@gmail.com</span>
            </div>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd,<br/>Urapakkam, Chennai, Tamil Nadu 603202</span>
            </div>
          </div>
          <div>
            <span className="footer-follow-label">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="#" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a className="social-btn" href="https://wa.me/+917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">2026 Apila Jewels. All Rights Reserved.</span>
          <img src={apilaLogo} alt="Apila Jewels" className="footer-logo-img"/>
          <span className="footer-secure">100% Secure Payments</span>
        </div>
      </footer>
    </div>
  );
}
