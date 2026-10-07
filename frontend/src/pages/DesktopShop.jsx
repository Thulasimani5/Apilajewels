import React, { useState, useMemo, useEffect, useRef, useContext, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useNavigationType, useLocation } from 'react-router-dom';
import CategoryContext from '../context/CategoryContext';
import { useAllProducts } from '../hooks/useProducts';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import DesktopSearchOverlay from './DesktopSearchOverlay';
import MenuDrawer from '../components/MenuDrawer';
import ShopCard from '../components/ShopCard';
import ShopFilterSidebar from '../components/ShopFilterSidebar';
import DesktopFooter from '../components/DesktopFooter';
import { desktopFiltersFromParams, desktopBuildParams, desktopBootstrapLegacy } from '../utils/shopFilterUtils';

import apilaLogo from '../assets/Apila Logo01.svg';
import downArrowIcon from '../assets/icons/downArrow.svg';
import '../styles/ApilaJewels.css';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Low Price' },
  { id: 'price_desc', label: 'High Price' },
  { id: 'popularity', label: 'Popularity' },
];

const ITEMS_PER_PAGE = 18;

const navIcons = {
  search: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  heart: (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
      <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor" />
    </svg>
  ),
  cart: (
    <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
      <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  acct: (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function DesktopShop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useContext(CategoryContext);

  const [open, setOpen] = useState({
    Category: true, Type: true, Occasion: true,
    Price: false, Colour: false, StoneColour: false, Stone: false, AccessoryTypes: false
  });

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef(null);

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

  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [navType]);

  useEffect(() => {
    if (!categories.length) return;
    const legacy = desktopBootstrapLegacy(searchParams, categories);
    if (legacy) {
      setSearchParams(desktopBuildParams(legacy, 'recommended', 1), { replace: true });
    }
  }, [categories, searchParams]);

  const activeFilters = useMemo(() => {
    const f = desktopFiltersFromParams(searchParams);
    if (location.pathname === '/sale') {
      f.sale = true;
    }
    return f;
  }, [searchParams, location.pathname]);
  const activeSort = searchParams.get('sort') || 'recommended';
  const page = parseInt(searchParams.get('page') || '1', 10);

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

  const isSalePage = Boolean(activeFilters.sale || searchParams.get('sale') === 'true' || searchParams.get('isSale') === 'true');

  const clearAll = useCallback(() => {
    setSearchParams(isSalePage ? new URLSearchParams({ sale: 'true' }) : new URLSearchParams(), { replace: false });
  }, [setSearchParams, isSalePage]);

  const { data: productsData, isLoading, isError, error } = useAllProducts();
  const products = productsData?.data || [];

  const { categoryOptions, typeOptions, sorted } = useFilteredProducts(products, activeFilters, activeSort, categories);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const winStart = page <= 2 ? 1 : Math.min(page - 1, Math.max(1, totalPages - 2));
  const visiblePages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => winStart + i);

  const headerTitle = useMemo(() => {
    if (activeFilters.Category.length) return activeFilters.Category.join(', ');
    if (activeFilters.Type?.length) return activeFilters.Type.join(', ');
    if (activeFilters.AccessoryType?.length) return activeFilters.AccessoryType.join(', ');
    if (activeFilters.Occasion.length) return activeFilters.Occasion.join(', ');
    if (isSalePage) return 'Jewellery to Own';
    return 'All Jewels';
  }, [activeFilters, isSalePage]);

  const sortLabel = SORT_OPTIONS.find(o => o.id === activeSort)?.label || 'Recommended';

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortMenuOpen(false); };
    if (sortMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortMenuOpen]);

  return (
    <div className="apila">
      {/* NAVBAR */}
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

      {/* TOPBAR */}
      <div className="shop-topbar">
        <div className="shop-topbar-left" />
        <div className="shop-topbar-right">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="shop-bc-home">Home</Link>
            <span className="shop-bc-sep" aria-hidden="true" />
            <span className="shop-bc-current">
              {isSalePage && headerTitle !== 'Jewellery to Own'
                ? `Jewellery to Own / ${headerTitle}`
                : headerTitle}
            </span>
          </nav>

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

      {/* MAIN BODY */}
      <div className="shop-body">
        <ShopFilterSidebar
          open={open}
          setOpen={setOpen}
          activeFilters={activeFilters}
          toggle={toggle}
          categoryOptions={categoryOptions}
          typeOptions={typeOptions}
        />

        <div className="shop-content">
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
              <p>{isSalePage ? 'No sale jewellery items found' : 'No matching jewellery found'}</p>
              <button className="shop-clear-btn" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {paginated.map(p => <ShopCard key={p._id} product={p} activeCategory={activeFilters.Category.length === 1 ? activeFilters.Category[0] : undefined} />)}
            </div>
          )}

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

      {isSearchOpen && <DesktopSearchOverlay onClose={() => setIsSearchOpen(false)} />}
      <MenuDrawer menuOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* FOOTER */}
      <DesktopFooter />
    </div>
  );
}
