import React, { useState, useMemo, useEffect, useRef, useContext, useCallback } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { useNavigationType } from 'react-router-dom';
import Card from './Card';
import FilterBottomSheet from './FilterBottomSheet';
import FilterSidebar from './FilterSidebar';
import CategoryContext from '../context/CategoryContext';
import SortBottomSheet from './SortBottomSheet';
import ProductGridSkeleton from './ProductGridSkeleton';
import Navbar from './Navbar';
import Footer from './Footer';
import { bootstrapFromLegacyParams, buildParams } from '../utils/shopFilterUtils';
import { useMobileShopProducts } from '../hooks/useMobileShopProducts';

const ITEMS_PER_PAGE = 16;

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' },
];

export default function MobileShopView() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  const { categories } = useContext(CategoryContext);
  const navType = useNavigationType();

  const {
    searchParams,
    setSearchParams,
    activeFilters,
    activeSort,
    currentPage,
    products,
    isLoading,
    isError,
    error,
    sortedProducts,
    getSortLabel,
    handleApplyFilters,
    setCurrentPage,
    setActiveSort,
    setFilters
  } = useMobileShopProducts();

  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [navType]);

  useEffect(() => {
    if (!categories.length) return;
    const legacy = bootstrapFromLegacyParams(searchParams, categories);
    if (legacy) {
      setSearchParams(buildParams(legacy, 'recommended', 1), { replace: true });
    }
  }, [categories, searchParams]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const windowSize = 3;
    let start = Math.max(1, currentPage - 1);
    let end = start + windowSize - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortDropdownOpen]);

  const activeFilterPills = useMemo(() => {
    const pills = [];
    Object.entries(activeFilters).forEach(([section, values]) => {
      values.forEach(value => {
        pills.push({ section, value });
      });
    });
    return pills;
  }, [activeFilters]);

  const removeFilterPill = useCallback((section, value) => {
    const updated = { ...activeFilters, [section]: activeFilters[section].filter(v => v !== value) };
    setFilters(updated, activeSort, 1);
  }, [activeFilters, activeSort, setFilters]);

  const totalFilterCount = activeFilterPills.length;

  return (
    <div className="bg-white min-h-screen md:h-screen md:overflow-hidden flex flex-col pt-16">
      <Navbar />

      <div className="md:hidden flex justify-between items-center px-4 pt-[1px] pb-[4px] bg-white">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-[9px] text-[#1A1A1A]"
        >
          <svg width="14" height="18" viewBox="0 0 16 10" fill="none" aria-hidden="true">
            <line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Gotham', sans-serif", fontSize: '12px', letterSpacing: '0.84px' }} className="uppercase">FILTER</span>
        </button>
        <div
          onClick={() => setIsSortOpen(true)}
          className="flex items-center gap-[4px] cursor-pointer"
        >
          <span style={{ fontFamily: "'Gotham Light', 'Gotham Book', sans-serif", fontSize: '13px', letterSpacing: '-0.13px' }} className="text-black">Sort by :</span>
          <span style={{ fontFamily: "'Gotham', sans-serif", fontSize: '13px', letterSpacing: '-0.13px' }} className="text-black">{getSortLabel(activeSort)}</span>
          <ChevronDown size={12} strokeWidth={2.2} className="text-[#1A1A1A]" />
        </div>
      </div>

      <div className="flex flex-1 items-start md:overflow-hidden md:min-h-0">
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30">
          <FilterSidebar
            activeFilters={activeFilters}
            onFilterChange={handleApplyFilters}
            products={products}
          />
        </div>

        <div className="flex-1 min-w-0 md:h-full md:overflow-y-auto md:flex md:flex-col">
          <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-[#F0EDED] bg-white sticky top-0 z-40">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              <span className="text-[13px] text-[#666] font-medium flex-shrink-0">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
              </span>

              {activeFilterPills.length > 0 && (
                <>
                  <span className="text-[#D5D5D5] mx-1 flex-shrink-0">|</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeFilterPills.map(({ section, value }) => (
                      <button
                        key={`${section}-${value}`}
                        onClick={() => removeFilterPill(section, value)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF8F3] text-[#A56D7A] rounded-full text-[11px] font-semibold border border-[#A56D7A]/15 hover:bg-[#A56D7A] hover:text-white transition-all duration-200 group"
                      >
                        {value}
                        <X size={12} className="text-[#A56D7A]/60 group-hover:text-white transition-colors" />
                      </button>
                    ))}
                    {totalFilterCount > 1 && (
                      <button
                        onClick={() => setSearchParams(new URLSearchParams(), { replace: false })}
                        className="text-[11px] text-[#A56D7A] font-bold uppercase tracking-wide hover:text-[#935b67] transition-colors ml-1"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="relative flex-shrink-0 ml-4" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-1.5 text-[12px] cursor-pointer px-3 py-1.5 rounded-lg border border-[#EBEBEB] hover:border-[#A56D7A]/30 transition-colors bg-white"
              >
                <span className="text-[#999] font-normal">Sort by :</span>
                <span className="text-[#1A1A1A] font-semibold">{getSortLabel(activeSort)}</span>
                <ChevronDown size={12} strokeWidth={2.2} className={`text-[#1A1A1A] transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[210px] bg-white border border-[#EBEBEB] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 overflow-hidden">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveSort(option.id);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeSort === option.id
                        ? 'text-[#A56D7A] font-semibold bg-[#FFF8F3]'
                        : 'text-[#333] hover:bg-[#FDFBFA] font-normal'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-[8px] md:px-5 pt-[8px] md:pt-4 pb-8">
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : isError ? (
              <div className="flex justify-center items-center py-20 text-red-500 font-semibold text-xs uppercase tracking-wider">
                {error?.message || 'Failed to load products'}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="w-16 h-16 rounded-full bg-[#FCF8F5] flex items-center justify-center">
                  <SlidersHorizontal size={24} className="text-[#A56D7A]/60" />
                </div>
                <p className="text-[#999] font-semibold text-xs uppercase tracking-wider">
                  No matching jewellery found
                </p>
                <button
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: false })}
                  className="text-[12px] text-[#A56D7A] font-bold underline underline-offset-2 hover:text-[#935b67] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[4px] gap-y-[20px] md:gap-4">
                {paginatedProducts.map((product, index) => (
                  <Card key={product._id} jewellery={product} priority={index < 6} variant="shop" imageAspect="195 / 244" imageClassName="" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="md:hidden flex items-center justify-center gap-[24px] py-6 pb-8 px-6">
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="flex items-center justify-center text-[12px] text-black/30">…</span>
            ) : (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ fontFamily: "'Gotham', sans-serif" }}
                className={`flex items-center justify-center text-[12px] transition-colors pb-[2px] min-w-[20px] ${currentPage === page
                  ? 'text-black font-medium border-b border-black'
                  : 'text-black/40 font-normal'
                  }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center disabled:opacity-25"
          >
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L1 11" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="md:hidden">
        <Footer />
      </div>

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={activeFilters}
        onApply={handleApplyFilters}
      />

      <SortBottomSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        selectedOption={activeSort}
        onSelect={setActiveSort}
      />
    </div>
  );
}
