import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import CategoryContext from '../context/CategoryContext';
import { useAllProducts } from '../hooks/useProducts';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';
import downArrowIcon from '../assets/icons/downArrow.svg';
import backArrowIcon from '../assets/icons/BackArrow.svg';
import '../styles/ApilaJewels.css';

/* ── Filter data ── */
const OCCASION_OPTIONS = ['Bridal Set', 'Bridesmaid', 'Designer Collection', 'Reception Jewels', 'Party Wear', 'Small Jewels'];
const PRICE_OPTIONS = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const COLOR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const STONE_COLOR_OPT = ['Clear', 'Blue', 'Pink', 'Red', 'Green', 'Yellow', 'White', 'Gold', 'Various', 'Orange', 'Black', 'Purple'];
const STONE_OPTIONS = ['Crystal', 'Sapphire', 'Pink Morganite', 'Ruby', 'Emerald', 'Pearl', 'Moissanite Stone', 'AD Stone', 'Kundan', 'Polki Stone'];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Low Price' },
  { id: 'price_desc', label: 'High Price' },
  { id: 'popularity', label: 'Popularity' },
];

const ITEMS_PER_PAGE = 12;

/* ── Funnel icon ── */
const FilterIcon = () => (
  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="0" y="0" width="16" height="1.5" fill="#000" />
    <rect x="2" y="4.25" width="12" height="1.5" fill="#000" />
    <rect x="5" y="8.5" width="6" height="1.5" fill="#000" />
  </svg>
);

/* ── Chevron ── */
const ChevronIcon = () => (
  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
    <path d="M1 1l6 6 6-6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Collapsible filter section ── */
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

/* ── Checkbox row ── */
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

/* ── Product card — matches homepage trending collections UI ── */
function ShopCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const price = product.rentalPrice || product.price || 0;
  const priceText = price >= 2000 ? 'Premium Collection' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

  return (
    <Link to={`/shop/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <button
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            if (!user) navigate('/login');
            else toggleWishlist(product);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? '#ab6281' : 'none'}
            stroke={liked ? '#ab6281' : 'currentColor'} strokeWidth="1.6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img
          src={getOptimizedCloudinaryUrl(imgUrl, { width: 390, height: 450 })}
          alt={product.name}
          loading="lazy"
        />
      </div>
      <p className="product-name">{category || 'Jewels'}</p>
      <p className="product-desc">{product.name}</p>
      <p className="product-price">{priceText}</p>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   DesktopShop — pixel-perfect Figma 263:1322
   ══════════════════════════════════════════════════════ */
export default function DesktopShop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories } = useContext(CategoryContext);
  const { user } = useAuth();

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
        if (r === 'Under ₹1000') return pr < 1000;
        if (r === '₹1000 - ₹2000') return pr >= 1000 && pr <= 2000;
        if (r === '₹2000 - ₹3000') return pr >= 2000 && pr <= 3000;
        if (r === 'Above ₹3000') return pr > 3000;
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
    if (activeSort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeSort === 'price_asc') return arr.sort((a, b) => (a.rentalPrice || a.price || 0) - (b.rentalPrice || b.price || 0));
    if (activeSort === 'price_desc') return arr.sort((a, b) => (b.rentalPrice || b.price || 0) - (a.rentalPrice || a.price || 0));
    if (activeSort === 'popularity') return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return arr;
  }, [filtered, activeSort]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  // Window: pages 1 & 2 stay fixed at [1,2,3]; page 3+ centres the active page
  const winStart = page <= 2 ? 1 : Math.min(page - 1, Math.max(1, totalPages - 2));
  const visiblePages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => winStart + i);

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
    search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
    heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    cart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
    acct: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    menu: null,
  };

  return (
    <div className="apila">

      {/* ── NAVBAR ── */}
      <header>
        <nav className={`navbar scrolled${navHidden ? ' nav-hidden' : ''}`}>
          <div className="nav-left">
            <div className="nav-hamburger" role="button" tabIndex={0}>
              <span /><span /><span />
            </div>
            <div className="nav-search" role="button" tabIndex={0} onClick={() => navigate('/shop')}>
              {navIcons.search}<span>Search</span>
            </div>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" />
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>{navIcons.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>{navIcons.cart}</button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/login')}>{navIcons.acct}</button>
          </div>
        </nav>
      </header>

      {/* ── TOPBAR: FILTER | breadcrumb + sort ── */}
      <div className="shop-topbar">
        {/* Left: funnel + FILTER label */}
        <div className="shop-topbar-left">
          {/* Spacer */}
        </div>

        {/* Right: breadcrumb + sort */}
        <div className="shop-topbar-right">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="shop-bc-home">Home</Link>
            <span className="shop-bc-sep" aria-hidden="true" />
            <span className="shop-bc-current">{headerTitle}</span>
          </nav>

          {/* Sort dropdown */}
          <div className="shop-sort-wrap" ref={sortRef}>
            <button className="shop-sort-btn" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
              <span className="shop-sort-label">Sort by : </span>
              <span className="shop-sort-value">{sortLabel}</span>
              <span className={`shop-sort-chevron${sortMenuOpen ? ' open' : ''}`}>
                <img src={downArrowIcon} alt="" aria-hidden="true" style={{ width: 13, height: 13, display: 'block', transform: 'rotate(-180deg)' }} />
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
          {/* Filter Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {Object.values(activeFilters).some(v => v.length > 0) && (
              <button className="shop-clear-btn" onClick={clearAll}>Clear All</button>
            )}
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="shop-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="shop-card-skeleton">
                  <div className="shop-card-img-skel" />
                  <div className="shop-card-txt-skel" />
                  <div className="shop-card-txt-skel" />
                  <div className="shop-card-txt-skel short" />
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
              {paginated.map(p => <ShopCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination: 1 2 3 > or < 2 3 4 > */}
          {totalPages > 1 && (
            <div className="shop-pagination">
              {page > 1 && (
                <button
                  className="shop-pag-btn"
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                >
                  <img src={downArrowIcon} alt="Previous" style={{ width: 15, height: 8, display: 'block', transform: 'rotate(-90deg)' }} />
                </button>
              )}
              {visiblePages.map(n => (
                <button
                  key={n}
                  className={`shop-pag-num${page === n ? ' active' : ''}`}
                  onClick={() => { setPage(n); window.scrollTo(0, 0); }}
                >
                  {n}
                </button>
              ))}
              <button
                className="shop-pag-btn"
                onClick={() => { setPage(p => Math.min(p + 1, totalPages)); window.scrollTo(0, 0); }}
                disabled={page >= totalPages}
                style={{ opacity: page >= totalPages ? 0.25 : 1 }}
              >
                <img src={downArrowIcon} alt="Next" style={{ width: 15, height: 8, display: 'block', transform: 'rotate(90deg)' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=moissanite">Moissanite Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=antique">Gold Antique</Link>
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
            <div className="footer-contact-row"><img src={iconCall} alt="Phone" className="footer-contact-icon" /><span className="footer-contact-text">+91 73977 21122</span></div>
            <div className="footer-contact-row"><img src={iconMail} alt="Mail" className="footer-contact-icon" /><span className="footer-contact-text">apila.jewels@gmail.com</span></div>
            <div className="footer-contact-row"><img src={iconLocation} alt="Location" className="footer-contact-icon" /><span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span></div>
          </div>
          <div>
            <span className="footer-col-head">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="#" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://wa.me/+917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src={iconWhatsapp} alt="WhatsApp" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">2026 Apila Jewels. All Rights Reserved.</span>
          <img src={apilaLogo} alt="Apila Jewels" className="footer-logo-img" />
          <span className="footer-secure">100% Secure Payments</span>
        </div>
      </footer>
    </div>
  );
}
