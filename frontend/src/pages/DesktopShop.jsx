import React, { useState, useMemo, useEffect, useRef, useContext, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
import CategoryContext from '../context/CategoryContext';
import { useAllProducts } from '../hooks/useProducts';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import DesktopSearchOverlay from './DesktopSearchOverlay';
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
const JEWELLERY_TYPE_OPTIONS = ['Choker & Necklace', 'Long Haram', 'Semi Bridal & Combo', 'Full Bridal Set', 'Accessories'];
const OCCASION_OPTIONS = ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'];
const PRICE_OPTIONS = ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'];
const COLOR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'];
const STONE_COLOR_OPT = ['Clear', 'Blue', 'Pink', 'Red', 'Green', 'Yellow', 'White', 'Gold', 'Various', 'Orange', 'Black', 'Purple'];
const STONE_OPTIONS = ['Crystal', 'Sapphire', 'Pink Morganite', 'Ruby', 'Emerald', 'Pearl', 'Moissanite Stone', 'AD Stone', 'Kundan', 'Polki Stone', 'Polki Diamond'];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Low Price' },
  { id: 'price_desc', label: 'High Price' },
  { id: 'popularity', label: 'Popularity' },
];

const ITEMS_PER_PAGE = 18;

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
  const priceText = product.showPrice === false || price > 1500 ? 'Price on Request' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

  return (
    <Link to={`/shop/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <button
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? '#fff' : 'none'}
            stroke={liked ? '#fff' : 'currentColor'} strokeWidth="1.6">
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

/* ── Filter key names used in the URL ── */
const DESKTOP_FILTER_KEYS = ['Category', 'Type', 'Occasion', 'Price', 'Colour', 'StoneColour', 'Stone', 'AccessoryType'];

const desktopFiltersFromParams = (params) => {
  const result = {};
  DESKTOP_FILTER_KEYS.forEach(key => { result[key] = params.getAll(key); });
  return result;
};

const desktopBuildParams = (filters, sort, page) => {
  const p = new URLSearchParams();
  DESKTOP_FILTER_KEYS.forEach(key => {
    (filters[key] || []).forEach(v => p.append(key, v));
  });
  if (sort && sort !== 'recommended') p.set('sort', sort);
  if (page && page > 1) p.set('page', String(page));
  return p;
};

/* ── Bootstrap legacy ?category= / ?occasion= to new multi-param format ── */
const desktopBootstrapLegacy = (searchParams, categories) => {
  if (DESKTOP_FILTER_KEYS.some(k => searchParams.has(k))) return null;
  const cat = searchParams.get('category');
  const occ = searchParams.get('occasion');
  if (!cat && !occ) return null;

  const EMPTY = { Category: [], Type: [], Occasion: [], Price: [], Colour: [], StoneColour: [], Stone: [], AccessoryType: [] };
  const f = { ...EMPTY };

  const occasionMap = {
    bridal: 'Bridal Set', 'bridal-set': 'Bridal Set', 'bridal-maid': 'Bridal Maid',
    bridesmaid: 'Bridal Maid', designer: 'Designer', 'designer-collection': 'Designer',
    reception: 'Reception', 'reception-jewels': 'Reception', party: 'Party Wear',
    'party-wear': 'Party Wear', small: 'Small Jewel', 'small-jewel': 'Small Jewel', 'small-jewels': 'Small Jewel',
  };
  const typeMap = {
    'semi-bridal': 'Semi Bridal & Combo Sets',
    'semi-bridal-combo': 'Semi Bridal & Combo Sets',
    'choker-necklace': 'Choker & Necklace',
    'long-haram': 'Long Haram',
    'full-bridal': 'Full Bridal Set',
    'accessories': 'Accessories',
    'bangles-bracelets': 'Bangles & Bracelets',
    'bangles-and-bracelets': 'Bangles & Bracelets',
    'bangles': 'Bangles & Bracelets',
    'gold-bangles': 'Bangles & Bracelets',
  };

  if (occ) { const v = occasionMap[occ.toLowerCase()]; if (v) { f.Occasion.push(v); return f; } }
  if (cat) {
    const norm = cat.toLowerCase();
    if (typeMap[norm]) { f.Type.push(typeMap[norm]); return f; }
    const matched = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === norm || c.name.toLowerCase() === norm);
    if (matched) {
      if (matched.showInSection === 'type') {
        f.Type.push(matched.name);
      } else {
        f.Category.push(matched.name);
      }
      return f;
    }
    if (norm.includes('moissanite') || norm === 'victorian-moissinate' || norm === 'moissinate') { f.Category.push('victorian-moissinate'); return f; }
    if (norm === 'kundan' || norm === 'kundan-jewels') { f.Category.push('Kundan Jewels'); return f; }
    if (norm === 'american-diamond' || norm === 'ad-jewels') { f.Category.push('AD Jewels'); return f; }
    if (norm.includes('antique') || norm === 'gold-antique-jewels') { f.Category.push('Gold Antique Jewels'); return f; }
    if (norm === 'polki') { f.Category.push('Polki'); return f; }
    f.Category.push(cat);
  }
  return f;
};

/* ══════════════════════════════════════════════════════
   DesktopShop — pixel-perfect Figma 263:1322
   ══════════════════════════════════════════════════════ */
export default function DesktopShop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useContext(CategoryContext);
  const { user, openLogin } = useAuth();

  /* ── Section open/closed state (UI only) ── */
  const [open, setOpen] = useState({
    Category: true, Type: true, Occasion: true,
    Price: false, Colour: false, StoneColour: false, Stone: false, AccessoryTypes: false
  });

  /* ── Sort + pagination ── */
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef(null);

  /* ── Navbar hide on scroll-down ── */
  const [navHidden, setNavHidden] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const navType = useNavigationType();

  /* ── Scroll to top on mount and path change ── */
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [navType]);

  /* ── Bootstrap: convert legacy ?category= / ?occasion= to new multi-value params ── */
  useEffect(() => {
    if (!categories.length) return;
    const legacy = desktopBootstrapLegacy(searchParams, categories);
    if (legacy) {
      setSearchParams(desktopBuildParams(legacy, 'recommended', 1), { replace: true });
    }
  }, [categories, searchParams]);

  /* ── Derive active filters, sort, page directly from URL ── */
  const activeFilters = useMemo(() => desktopFiltersFromParams(searchParams), [searchParams]);
  const activeSort = searchParams.get('sort') || 'recommended';
  const page = parseInt(searchParams.get('page') || '1', 10);

  /* ── Helpers to write back to URL ── */
  const toggle = useCallback((section, value) => {
    const cur = activeFilters[section] || [];
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
    const updated = { ...activeFilters, [section]: next };
    setSearchParams(desktopBuildParams(updated, activeSort, 1), { replace: false });
  }, [activeFilters, activeSort, setSearchParams]);

  const setPage = useCallback((pageOrFn) => {
    const nextPage = typeof pageOrFn === 'function' ? pageOrFn(page) : pageOrFn;
    setSearchParams(desktopBuildParams(activeFilters, activeSort, nextPage), { replace: false });
  }, [activeFilters, activeSort, page, setSearchParams]);

  const setActiveSort = useCallback((sort) => {
    setSearchParams(desktopBuildParams(activeFilters, sort, 1), { replace: false });
  }, [activeFilters, setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);


  /* ── Data ── */
  const { data: productsData, isLoading, isError, error } = useAllProducts();
  const products = productsData?.data || [];

  const categoryOptions = useMemo(() => categories.filter(c => c.showInSection !== 'type').map(c => c.name), [categories]);
  const typeOptions = useMemo(() => {
    const opts = categories.filter(c => c.showInSection === 'type').map(c => c.name);
    const accIndex = opts.findIndex(o => o.toLowerCase() === 'accessories');
    if (accIndex > -1) {
      const [acc] = opts.splice(accIndex, 1);
      opts.push(acc);
    }
    return opts;
  }, [categories]);

  /* ── Filter products ── */
  const filtered = useMemo(() => {
    // Check if user has explicitly selected Accessories type or any AccessoryType subtype
    const hasAccessoriesTypeFilter = activeFilters.Type?.some(t => t.toLowerCase() === 'accessories');
    const hasAccessorySubtypeFilter = activeFilters.AccessoryType?.length > 0;
    const showAccessories = hasAccessoriesTypeFilter || hasAccessorySubtypeFilter;

    return products.filter(p => {
    // Exclude Accessories items unless user explicitly selected Accessories or a subtype
    if (!showAccessories) {
      const ptypes = Array.isArray(p.type) ? p.type : [p.type];
      if (ptypes.some(t => t?.toLowerCase() === 'accessories')) return false;
    }

    const cats = Array.isArray(p.category) ? p.category : [p.category];
    if (activeFilters.Category.length > 0 &&
      !activeFilters.Category.some(c => cats.some(pc => pc?.toLowerCase() === c.toLowerCase()))) return false;

    const types = Array.isArray(p.type) ? p.type : [p.type];
    if (activeFilters.Type?.length > 0 &&
      !activeFilters.Type.some(t => types.some(pt => {
        const normT = t.toLowerCase();
        const normPt = pt?.toLowerCase() || '';
        if (normT.includes('semi bridal') && normPt.includes('semi bridal')) return true;
        return normPt === normT;
      }))) return false;
      
    if (activeFilters.AccessoryType?.length > 0) {
      const ptypes = Array.isArray(p.type) ? p.type : [p.type];
      const isAccessory = ptypes.some(t => t?.toLowerCase() === 'accessories');
      if (!isAccessory || !activeFilters.AccessoryType.some(acc => p.accessoryType?.toLowerCase() === acc.toLowerCase())) return false;
    }

    const occs = Array.isArray(p.occasion) ? p.occasion : [p.occasion];
    if (activeFilters.Occasion?.length > 0 &&
      !activeFilters.Occasion.some(o => occs.some(po => po?.toLowerCase() === o.toLowerCase()))) return false;

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
  });
  }, [products, activeFilters]);

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
    if (activeFilters.Type?.length) return activeFilters.Type.join(', ');
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


  const navIcons = {
    search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
    heart: <svg width="18" height="16" viewBox="0 0 18 16" fill="none"><path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor" /></svg>,
    cart: <svg width="15" height="17" viewBox="0 0 15 17" fill="none"><path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    acct: <svg width="13" height="15" viewBox="0 0 13 15" fill="none"><path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    menu: null,
  };

  return (
    <div className="apila">

      {/* ── NAVBAR ── */}
      <header>
        <nav className={`navbar shop-nav scrolled${navHidden ? ' nav-hidden' : ''}`}>
          <div className="nav-left">
            <div className="nav-hamburger" role="button" tabIndex={0} onClick={() => setIsDrawerOpen(true)} style={{ cursor: 'pointer' }}>
              <span /><span /><span />
            </div>
            <div className="nav-search" role="button" tabIndex={0} onClick={() => setIsSearchOpen(true)}>
              {navIcons.search}<span>Search</span>
            </div>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" />
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>{navIcons.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>{navIcons.cart}</button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/profile')}>{navIcons.acct}</button>
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
                    onClick={() => { setActiveSort(opt.id); setSortMenuOpen(false); }}
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
                        {['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories'].map(sub => (
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

        {/* ── RIGHT PRODUCT AREA ── */}
        <div className="shop-content">

          {/* (Item count and clear removed) */}

          {/* Product grid */}
          {isLoading ? (
            <div className="shop-grid">
              {Array.from({ length: 18 }).map((_, i) => (
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

      {/* ── Search Overlay ── */}
      {isSearchOpen && <DesktopSearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {/* ── MENU DRAWER (Figma 491:2) ── */}
      <div className={`menu-overlay${isDrawerOpen ? ' open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="menu-backdrop" onClick={() => setIsDrawerOpen(false)} />
        <div className="menu-panel">

          {/* Topbar: close button + search bar */}
          <div className="menu-topbar">
            <button className="menu-close-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1l11 11M12 1L1 12" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <div className="menu-searchbar" onClick={() => { setIsDrawerOpen(false); setIsSearchOpen(true); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="menu-search-placeholder">Search</span>
            </div>
          </div>

          {/* ── scrollable nav area ── */}
          <div className="menu-nav-scroll">

            {/* Section 1 — CATEGORY */}
            <span className="menu-section-heading">Category</span>
            <ul className="menu-section menu-section--first">
              {[
                { label: 'Victorian & Moissinate', slug: 'victorian-moissinate' },
                { label: 'AD Jewels', slug: 'ad-jewels' },
                { label: 'Gold Antique Jewels', slug: 'gold-antique-jewels' },
                { label: 'Kundan Jewels', slug: 'kundan-jewels' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={() => setIsDrawerOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

            <hr className="menu-rule" />

            {/* Section 2 — JEWELLERY TYPE */}
            <span className="menu-section-heading">Jewellery Type</span>
            <ul className="menu-section">
              {[
                { label: 'Choker & Necklace', slug: 'choker-necklace' },
                { label: 'Long Haram', slug: 'long-haram' },
                { label: 'Semi Bridal & Combo Sets', slug: 'semi-bridal' },
                { label: 'Full Bridal Set', slug: 'full-bridal' },
                { label: 'Bangles', slug: 'bangles-bracelets' },
                { label: 'Accessories', slug: 'accessories' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={() => setIsDrawerOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

            <hr className="menu-rule" />

            {/* Section 3 — OCCASION */}
            <span className="menu-section-heading">Occasion</span>
            <ul className="menu-section">
              {[
                { label: 'Bridal Set', slug: 'bridal' },
                { label: 'Bridesmaid', slug: 'bridesmaid' },
                { label: 'Designer Collection', slug: 'designer' },
                { label: 'Reception Jewels', slug: 'reception' },
                { label: 'Party Wear', slug: 'party' },
                { label: 'Small Jewels', slug: 'small' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?occasion=${item.slug}`} className="menu-item-link" onClick={() => setIsDrawerOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

          </div>

          {/* ── static Contact Us (always visible at bottom) ── */}
          <div className="menu-contact">
            <p className="menu-contact-heading">Contact Us</p>
            <hr className="menu-rule menu-rule--contact" />
            <a href="tel:+917397721122" className="menu-contact-row">
              <img src={iconCall} width="14" height="14" alt="" />
              <span>+91 73977 21122</span>
            </a>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=victorian-moissinate">Moissanite Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad-jewels">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=gold-antique-jewels">Gold Antique</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan-jewels">Kundan Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=gold-bangles">Bangles</Link>
          </div>
          <div>
            <span className="footer-col-head">Support</span>
            <Link className="footer-link-lg" to="/rental-policy">Delivery &amp; Pickup</Link>
            <Link className="footer-link-lg" to="/terms">Rental Terms</Link>
            <Link className="footer-link-lg" to="/faqs">FAQ</Link>
            <Link className="footer-link-lg" to="/care">Care Instructions</Link>
            <Link className="footer-link-lg" to="/" state={{ scrollTo: 'footer-contact' }}>Contact Us</Link>
          </div>
          <div>
            <span className="footer-col-head">Contact</span>
            <a href="tel:+917397721122" className="footer-contact-row"><img src={iconCall} alt="Phone" className="footer-contact-icon" /><span className="footer-contact-text">+91 73977 21122</span></a>
            <a href="mailto:apila.jewels@gmail.com" className="footer-contact-row"><img src={iconMail} alt="Mail" className="footer-contact-icon" /><span className="footer-contact-text">apila.jewels@gmail.com</span></a>
            <a href="https://maps.google.com/?q=SIS+Marakesh,Karanai+Puducherry+Rd,Urapakkam,Chennai,Tamil+Nadu+603202" target="_blank" rel="noreferrer" className="footer-contact-row"><img src={iconLocation} alt="Location" className="footer-contact-icon" /><span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span></a>
          </div>
          <div>
            <span className="footer-col-head">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="https://www.instagram.com/apila_jewels/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://www.facebook.com/profile.php?id=61590540475572" target="_blank" rel="noreferrer" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://in.pinterest.com/apilajewels/" target="_blank" rel="noreferrer" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="http://whatsapp.com/catalog/917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
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
