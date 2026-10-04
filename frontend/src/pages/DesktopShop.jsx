import React, { useState, useMemo, useEffect, useRef, useContext, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
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

export default function DesktopShop() {
  const navigate = useNavigate();
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

  const activeFilters = useMemo(() => desktopFiltersFromParams(searchParams), [searchParams]);
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

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

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
    if (activeFilters.Occasion.length) return activeFilters.Occasion.join(', ');
    return 'All Jewels';
  }, [activeFilters]);

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
            <span className="shop-bc-current">{headerTitle}</span>
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
              <p>No matching jewellery found</p>
              <button className="shop-clear-btn" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {paginated.map(p => <ShopCard key={p._id} product={p} />)}
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
