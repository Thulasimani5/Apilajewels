import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import { ArrowLeft, Search, Heart, ShoppingCart, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import FilterBottomSheet from '../components/FilterBottomSheet';
import FilterSidebar from '../components/FilterSidebar';
import CategoryContext from '../context/CategoryContext';
import SortBottomSheet from '../components/SortBottomSheet';
import SearchOverlay from '../components/SearchOverlay';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { useAllProducts } from '../hooks/useProducts';
import DesktopShop from './DesktopShop';
import useIsDesktop from '../hooks/useIsDesktop';
import { useWishlist } from '../context/WishlistContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

/* ── Sort options ── */
const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' },
];

const JewelleryListing = () => {
  const isDesktop = useIsDesktop();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Modal toggle states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(20); // start with 20 items
  const loadMoreRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Read URL search params
  const [searchParams] = useSearchParams();

  const { categories } = useContext(CategoryContext);

  // Selected filter criteria state
  const [activeFilters, setActiveFilters] = useState({
    Colour: [],
    Type: [],
    Price: [],
    Occasion: [],
    Category: [],
    StoneName: [],
    StoneColour: []
  });

  // Selected sorting criteria state
  const [activeSort, setActiveSort] = useState('recommended');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize active filters from URL query parameters dynamically
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const occasionParam = searchParams.get('occasion');

    const newCategoryFilters = [];
    const newTypeFilters = [];

    // Helper to map normalized strings to display names
    const typeMap = {
      'bridal-set': 'Bridal Set',
      'bridal-maid': 'Bridal Maid',
      'designer': 'Designer',
      'reception': 'Reception',
      'party-wear': 'Party Wear',
      'small-jewel': 'Small Jewel',
      'small-jewels': 'Small Jewel',
    };

    if (categoryParam) {
      const normalized = categoryParam.toLowerCase();
      // First try to match a known category in the data model
      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().replace(/\s+/g, '-') === normalized
      );
      if (matchedCategory) {
        newCategoryFilters.push(matchedCategory.name);
      } else if (typeMap[normalized]) {
        // If the param actually represents a type/occasion, push to type filters
        newTypeFilters.push(typeMap[normalized]);
      } else if (normalized === 'moissanite') {
        newCategoryFilters.push('Moissanite');
      } else if (normalized.includes('temple')) {
        newCategoryFilters.push('Temple Jewellery');
      } else if (normalized === 'kundan') {
        newCategoryFilters.push('Kundan');
      } else if (normalized === 'american-diamond' || normalized === 'american-diamond-bangles') {
        newCategoryFilters.push('AD Jewels');
      } else if (normalized.includes('ad')) {
        newCategoryFilters.push('AD Jewels');
      } else if (normalized === 'polki') {
        newCategoryFilters.push('Polki');
      } else if (normalized.includes('antique') || normalized === 'gold') {
        newCategoryFilters.push('Antique Jewel');
      } else {
        // Fallback for unmatched categories like "Necklace", "Earrings", etc.
        newCategoryFilters.push(categoryParam);
      }
    }

    if (occasionParam) {
      const normalized = occasionParam.toLowerCase();
      if (normalized === 'bridal' || normalized === 'bridal-set') newTypeFilters.push('Bridal Set');
      else if (normalized === 'reception' || normalized === 'reception-jewels') newTypeFilters.push('Reception');
      else if (normalized === 'party' || normalized === 'party-wear') newTypeFilters.push('Party Wear');
      else if (normalized === 'bridesmaid') newTypeFilters.push('Bridal Maid');
      else if (normalized === 'designer' || normalized === 'designer-collection') newTypeFilters.push('Designer');
      else if (normalized === 'small' || normalized === 'small-jewel' || normalized === 'small-jewels') newTypeFilters.push('Small Jewel');
      else if (typeMap[normalized]) newTypeFilters.push(typeMap[normalized]); // fallback for other type mappings
    }

    setActiveFilters({
      Colour: [],
      Type: newTypeFilters,
      Price: [],
      Occasion: [],
      Category: newCategoryFilters,
      StoneName: [],
      StoneColour: []
    });
  }, [searchParams, categories]);

  // Phase 5+6: React Query replaces manual fetch — cached across navigations
  const { data: productsData, isLoading, isError, error } = useAllProducts();
  const products = productsData?.data || [];

  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    setVisibleCount(20); // Reset scroll on filter change
  };

  const getSortLabel = (sortId) => {
    const opt = SORT_OPTIONS.find(o => o.id === sortId);
    return opt ? opt.label : 'Recommended';
  };

  // Filter products by selected categories, colours, occasions, and price ranges
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by Category (supports both string and array properties)
      if (activeFilters.Category.length > 0) {
        const matchesCategory = activeFilters.Category.some((cat) => {
          if (Array.isArray(product.category)) {
            return product.category.some(c => c?.toLowerCase() === cat.toLowerCase());
          }
          return product.category?.toLowerCase() === cat.toLowerCase();
        });
        if (!matchesCategory) return false;
      }

      // Filter by Colour
      if (activeFilters.Colour.length > 0) {
        const matchesColour = activeFilters.Colour.some((col) => {
          if (Array.isArray(product.colour)) {
            return product.colour.some(c => c?.toLowerCase() === col.toLowerCase());
          }
          return product.colour?.toLowerCase() === col.toLowerCase();
        });
        if (!matchesColour) return false;
      }

      // Filter by Occasion
      if (activeFilters.Occasion.length > 0) {
        const matchesOccasion = product.occasion?.some((occ) =>
          activeFilters.Occasion.some((selectedOcc) => selectedOcc.toLowerCase() === occ.toLowerCase())
        );
        if (!matchesOccasion) return false;
      }

      // Filter by Price Range
      if (activeFilters.Price.length > 0) {
        const matchesPrice = activeFilters.Price.some((range) => {
          if (range === 'Under ₹1000') return product.price < 1000;
          if (range === '₹1000 - ₹2000') return product.price >= 1000 && product.price <= 2000;
          if (range === '₹2000 - ₹3000') return product.price >= 2000 && product.price <= 3000;
          if (range === 'Above ₹3000') return product.price > 3000;
          return true;
        });
        if (!matchesPrice) return false;
      }

      // Filter by Type
      if (activeFilters.Type.length > 0) {
        const matchesType = activeFilters.Type.some((type) => {
          if (Array.isArray(product.type)) {
            return product.type.some(t => t?.toLowerCase() === type.toLowerCase());
          }
          return product.type?.toLowerCase() === type.toLowerCase();
        });
        if (!matchesType) return false;
      }

      // Filter by Stone Name
      if (activeFilters.StoneName && activeFilters.StoneName.length > 0) {
        const matchesStoneName = activeFilters.StoneName.some((stone) => {
          if (Array.isArray(product.stoneName)) {
            return product.stoneName.some(s => s?.toLowerCase() === stone.toLowerCase());
          }
          return product.stoneName?.toLowerCase() === stone.toLowerCase();
        });
        if (!matchesStoneName) return false;
      }

      // Filter by Stone Colour
      if (activeFilters.StoneColour && activeFilters.StoneColour.length > 0) {
        const matchesStoneColour = activeFilters.StoneColour.some((scolor) => {
          if (Array.isArray(product.stoneColour)) {
            return product.stoneColour.some(s => s?.toLowerCase() === scolor.toLowerCase());
          }
          return product.stoneColour?.toLowerCase() === scolor.toLowerCase();
        });
        if (!matchesStoneColour) return false;
      }

      return true;
    });
  }, [products, activeFilters]);

  // Compute sorted products dynamically based on selected option
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (activeSort === 'newest') {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeSort === 'price_low_high') {
      return sorted.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_high_low') {
      return sorted.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'popularity') {
      return sorted.sort((a, b) => b.popularity - a.popularity);
    } else {
      // Default: sort by id or initial order
      return sorted;
    }
  }, [filteredProducts, activeSort]);

  // Infinite scroll effect
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 20, sortedProducts.length));
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [sortedProducts]);

  // Close sort dropdown on outside click
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

  const getHeaderTitle = () => {
    if (activeFilters.Category.length > 0) {
      const categoryName = activeFilters.Category.join(', ');
      if (categoryName.toLowerCase().includes('jewel') || categoryName.toLowerCase().includes('jewellery')) {
        return categoryName;
      }
      return `${categoryName} Jewels`;
    }
    if (activeFilters.Type.length > 0) {
      if (activeFilters.Type.length === 1) {
        return activeFilters.Type[0];
      }
      return `${activeFilters.Type.join(', ')} Collection`;
    }
    if (activeFilters.Occasion.length > 0) {
      return `${activeFilters.Occasion.join(', ')} Collection`;
    }
    if (searchParams.get('explore') === 'true') {
      return '';
    }
    return 'All Jewels';
  };

  /* ── Collect all active filter pills for display ── */
  const activeFilterPills = useMemo(() => {
    const pills = [];
    Object.entries(activeFilters).forEach(([section, values]) => {
      values.forEach(value => {
        pills.push({ section, value });
      });
    });
    return pills;
  }, [activeFilters]);

  /* ── Remove a single filter pill ── */
  const removeFilterPill = (section, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [section]: prev[section].filter(v => v !== value),
    }));
  };

  /* ── Total active filter count ── */
  const totalFilterCount = activeFilterPills.length;

  if (isDesktop) {
    return <DesktopShop />;
  }

  return (
    <div className="bg-white min-h-screen md:h-screen md:overflow-hidden flex flex-col">

      {/* ── Header ── sticky white bar with back arrow, title, and action icons */}
      <header className="sticky top-0 bg-white z-50 px-4 h-[60px] flex items-center justify-between border-b border-[#F0EDED]">
        <div className="flex items-center gap-[10px]">
          <Link to="/" className="text-[#1A1A1A] flex items-center justify-center">
            <ArrowLeft size={22} strokeWidth={2.2} />
          </Link>
          <h1 className="font-semibold text-[15px] text-[#1A1A1A] tracking-[-0.2px] leading-[1.2]">
            {getHeaderTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-[18px] text-[#1A1A1A]">
          <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center" aria-label="Search">
            <Search size={20} strokeWidth={2} />
          </button>
          <Link to="/wishlist" className="flex items-center justify-center" aria-label="Wishlist">
            <Heart size={20} strokeWidth={2} />
          </Link>
          <Link to="/cart" className="flex items-center justify-center" aria-label="Cart">
            <ShoppingCart size={20} strokeWidth={2} />
          </Link>
        </div>
      </header>

      {/* ── Mobile-only Filter & Sort bar ── (hidden on md+) */}
      <div className="md:hidden flex justify-between items-center px-4 py-3 border-b border-gray-100 sticky top-[60px] z-20 bg-white">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.1em] text-[#111] uppercase"
          style={{ fontFamily: "'Gotham', sans-serif" }}
        >
          <SlidersHorizontal size={14} strokeWidth={2} /> FILTER
        </button>
        <div
          onClick={() => setIsSortOpen(true)}
          className="flex items-center gap-1.5 text-[10.5px] cursor-pointer"
          style={{ fontFamily: "'Gotham', sans-serif" }}
        >
          <span className="text-[#666]">Sort by :</span>
          <span className="text-[#111] font-bold">{getSortLabel(activeSort)}</span>
          <ChevronDown size={14} strokeWidth={2} className="text-[#111]" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT — 2-column on desktop, single column on mobile
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 items-start md:overflow-hidden md:min-h-0">

        {/* ── Desktop Sidebar (hidden on mobile) ── */}
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30">
          <FilterSidebar
            activeFilters={activeFilters}
            onFilterChange={handleApplyFilters}
            products={products}
          />
        </div>

        {/* ── Right Content Area: Active pills bar + product grid ── */}
        <div className="flex-1 min-w-0 md:h-full md:overflow-y-auto md:flex md:flex-col">

          {/* ── Desktop Active Filters Bar + Sort ── (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-[#F0EDED] bg-white sticky top-0 z-40">
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
              {/* Result count */}
              <span className="text-[13px] text-[#666] font-medium flex-shrink-0">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
              </span>

              {/* Active filter pills */}
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
                        onClick={() => handleApplyFilters({ Colour: [], Type: [], Price: [], Occasion: [], Category: [], StoneName: [], StoneColour: [] })}
                        className="text-[11px] text-[#A56D7A] font-bold uppercase tracking-wide hover:text-[#935b67] transition-colors ml-1"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="relative flex-shrink-0 ml-4" ref={sortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-1.5 text-[12px] cursor-pointer px-3 py-1.5 rounded-lg border border-[#EBEBEB] hover:border-[#A56D7A]/30 transition-colors bg-white"
              >
                <span className="text-[#999] font-normal">Sort by :</span>
                <span className="text-[#1A1A1A] font-semibold">{getSortLabel(activeSort)}</span>
                <ChevronDown size={12} strokeWidth={2.2} className={`text-[#1A1A1A] transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort dropdown menu */}
              {isSortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[210px] bg-white border border-[#EBEBEB] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 overflow-hidden">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveSort(option.id);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                        activeSort === option.id
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

          {/* ── Product Grid ── */}
          <div className="px-[4px] pt-[4px] pb-8">
            {isLoading ? (
              /* Phase 7: Skeleton loader — no more blocking spinner */
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
                  onClick={() => handleApplyFilters({ Colour: [], Type: [], Price: [], Occasion: [], Category: [], StoneName: [], StoneColour: [] })}
                  className="text-[12px] text-[#A56D7A] font-bold underline underline-offset-2 hover:text-[#935b67] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* ── Responsive Product Grid with infinite scroll ── */}
                <div className="grid grid-cols-2 gap-[4px]">
                  {sortedProducts.slice(0, visibleCount).map((product, index) => {
                    const liked = isInWishlist(product._id || product.code);
                    const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80';
                    return (
                      <Link
                        key={product._id}
                        to={`/shop/${product._id || product.code}`}
                        className="block group bg-white"
                      >
                        <div className="relative overflow-hidden bg-[#F0EDED]" style={{ aspectRatio: '3/4' }}>
                          {product.images?.[0]?.type === 'video' ? (
                            <video
                              src={product.images[0].url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              autoPlay
                            />
                          ) : (
                            <img
                              src={getOptimizedCloudinaryUrl(imageUrl, { width: 400, height: 533 })}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading={index < 6 ? "eager" : "lazy"}
                              fetchPriority={index < 6 ? "high" : "auto"}
                            />
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className={`absolute top-2 right-2 w-[24px] h-[24px] flex items-center justify-center transition-all ${liked ? '' : 'opacity-80'}`}
                          >
                            <Heart
                              size={16}
                              className={liked ? 'fill-[#A65A6F] text-[#A65A6F]' : 'text-white'}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
                        <div className="pt-2 pb-4 px-1">
                          <p className="text-[10px] font-bold text-[#111] mb-[2px]" style={{ fontFamily: "'Gotham', sans-serif" }}>
                            {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                          </p>
                          <h3 className="text-[9.5px] text-[#666] line-clamp-2 leading-[1.3] mb-1.5" style={{ fontFamily: "'Gotham', sans-serif" }}>
                            {product.name}
                          </h3>
                          <p className="text-[11px] font-bold text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>
                            {product.rentalPrice >= 2000
                              ? 'Premium Collection'
                              : `₹${product.rentalPrice?.toFixed(2)}`}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {/* sentinel element for infinite scroll */}
                <div ref={loadMoreRef} className="h-1"></div>
                {/* Loading more indicator */}
                {visibleCount < sortedProducts.length && (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-[3px] border-[#A56D7A] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet Modal ── */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={activeFilters}
        onApply={handleApplyFilters}
      />

      {/* ── Mobile Sort Bottom Sheet Modal ── */}
      <SortBottomSheet
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        selectedOption={activeSort}
        onSelect={setActiveSort}
      />

      {/* ── Search Overlay ── */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        category={activeFilters.Category.length > 0 ? activeFilters.Category[0] : null}
        type={activeFilters.Type.length > 0 ? activeFilters.Type[0] : null}
      />
    </div>
  );
};

export default JewelleryListing;
