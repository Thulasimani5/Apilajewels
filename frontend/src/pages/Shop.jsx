import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import FilterBottomSheet from '../components/FilterBottomSheet';
import CategoryContext from '../context/CategoryContext';
import { useContext } from 'react';
import SortBottomSheet from '../components/SortBottomSheet';
import SearchOverlay from '../components/SearchOverlay';

const JewelleryListing = () => {
  // Modal toggle states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(20); // start with 20 items
  const loadMoreRef = useRef(null);

// infinite scroll effect moved below

  // Read URL search params
  const [searchParams] = useSearchParams();

  const { categories } = useContext(CategoryContext);

  // Selected filter criteria state
  const [activeFilters, setActiveFilters] = useState({
    Colour: [],
    Type: [],
    Price: [],
    Occasion: [],
    Category: []
  });

  // Selected sorting criteria state
  const [activeSort, setActiveSort] = useState('recommended');

  // Initialize active filters from URL query parameters dynamically
  React.useEffect(() => {
    const categoryParam = searchParams.get('category');
    const occasionParam = searchParams.get('occasion');

    const newCategoryFilters = [];
    if (categoryParam) {
      const normalized = categoryParam.toLowerCase();
      const matchedCategory = categories.find(c => 
        c.name.toLowerCase().replace(/\s+/g, '-') === normalized
      );

      if (matchedCategory) {
        newCategoryFilters.push(matchedCategory.name);
      } else if (normalized === 'moissanite') {
        newCategoryFilters.push('Moissanite');
      } else if (normalized.includes('temple')) {
        newCategoryFilters.push('Temple Jewellery');
      } else if (normalized === 'kundan') {
        newCategoryFilters.push('Kundan');
      } else if (normalized.includes('ad')) {
        newCategoryFilters.push('AD Jewellery');
      } else if (normalized === 'polki') {
        newCategoryFilters.push('Polki');
      } else if (normalized.includes('antique') || normalized === 'gold') {
        newCategoryFilters.push('Antique Jewel');
      } else {
        // Fallback for unmatched categories like "Necklace", "Earrings", etc.
        newCategoryFilters.push(categoryParam);
      }
    }

    const newTypeFilters = [];
    if (occasionParam) {
      const normalized = occasionParam.toLowerCase();
      if (normalized === 'bridal') newTypeFilters.push('Bridal Set');
      else if (normalized === 'reception') newTypeFilters.push('Reception');
      else if (normalized === 'party') newTypeFilters.push('Party Wear');
      else if (normalized === 'bridesmaid') newTypeFilters.push('Bridal Maid');
      else if (normalized === 'designer') newTypeFilters.push('Designer');
      else if (normalized === 'small') newTypeFilters.push('Small Jewel');
    }

    setActiveFilters({
      Colour: [],
      Type: newTypeFilters,
      Price: [],
      Occasion: [],
      Category: newCategoryFilters
    });
  }, [searchParams, categories]);

  // API Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend database on mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/jewellery?limit=100');
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        } else {
          setError(result.error || 'Failed to fetch items');
        }
      } catch (err) {
        setError(err.message || 'Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    console.log('Applied filters:', newFilters);
  };

  const getSortLabel = (sortId) => {
    switch (sortId) {
      case 'newest': return 'Newest First';
      case 'price_low_high': return 'Price: Low to High';
      case 'price_high_low': return 'Price: High to Low';
      case 'popularity': return 'Popularity';
      case 'recommended':
      default:
        return 'Recommended';
    }
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

const getHeaderTitle = () => {
    if (activeFilters.Category.length > 0) {
      return `${activeFilters.Category.join(', ')} Jewels`;
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
    return 'Moissanite Jewels';
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── Header ── sticky white bar with back arrow, title, and action icons */}
      <header className="sticky top-0 bg-white z-40 px-4 py-[11px] flex items-center justify-between">
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

      {/* ── Filter & Sort bar ── */}
      <div className="flex justify-between items-center px-4 py-[8px]">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-[3px] text-[13px] font-medium text-[#1A1A1A]"
        >
          Filter <ChevronDown size={14} strokeWidth={2.2} />
        </button>
        <div
          onClick={() => setIsSortOpen(true)}
          className="flex items-center gap-[5px] text-[12px] cursor-pointer"
        >
          <span className="text-[#999] font-normal">Sort by :</span>
          <span className="text-[#1A1A1A] font-semibold">{getSortLabel(activeSort)}</span>
          <ChevronDown size={12} strokeWidth={2.2} className="text-[#1A1A1A]" />
        </div>
      </div>

      {/* ── Product Grid ── 2-col grid, tight 10px gap, symmetric horizontal padding */}
      <div className="px-[14px] pt-[4px] pb-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 text-gray-500 gap-2">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Loading Jewels...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20 text-red-500 font-semibold text-xs uppercase tracking-wider">
            {error}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-400 font-semibold text-xs uppercase tracking-wider">
            No matching jewellery found
          </div>
        ) : (
          <>
            {/* ── Product Grid ── responsive grid with infinite scroll ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]">
              {sortedProducts.slice(0, visibleCount).map(product => (
                <Card key={product._id} jewellery={product} />
              ))}
            </div>
            {/* sentinel element for infinite scroll */}
            <div ref={loadMoreRef} className="h-1"></div>
          </>
        )}
      </div>

      {/* ── Filter Bottom Sheet Modal ── */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={activeFilters}
        onApply={handleApplyFilters}
      />

      {/* ── Sort Bottom Sheet Modal ── */}
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
