import { useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAllProducts } from './useProducts';
import { filtersFromParams, buildParams } from '../utils/shopFilterUtils';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' },
];

export function useMobileShopProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const activeFilters = useMemo(() => {
    const f = filtersFromParams(searchParams);
    if (location.pathname === '/sale') {
      f.sale = true;
    }
    return f;
  }, [searchParams, location.pathname]);

  const isSalePage = Boolean(
    activeFilters.sale ||
    searchParams.get('sale') === 'true' ||
    searchParams.get('isSale') === 'true' ||
    location.pathname === '/sale'
  );

  const activeSort = searchParams.get('sort') || 'recommended';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const setFilters = useCallback((newFilters, sort, page) => {
    setSearchParams(
      buildParams(newFilters, sort ?? activeSort, page ?? 1),
      { replace: false }
    );
  }, [setSearchParams, activeSort]);

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters, activeSort, 1);
  }, [setFilters, activeSort]);

  const setCurrentPage = useCallback((pageOrFn) => {
    const nextPage = typeof pageOrFn === 'function' ? pageOrFn(currentPage) : pageOrFn;
    setSearchParams(buildParams(activeFilters, activeSort, nextPage), { replace: false });
  }, [setSearchParams, activeFilters, activeSort, currentPage]);

  const setActiveSort = useCallback((sort) => {
    setSearchParams(buildParams(activeFilters, sort, 1), { replace: false });
  }, [setSearchParams, activeFilters]);

  const { data: productsData, isLoading, isError, error } = useAllProducts();
  const products = productsData?.data || [];

  const getSortLabel = (sortId) => {
    if (sortId === 'price_asc' || sortId === 'price_low_high') return 'Price: Low to High';
    if (sortId === 'price_desc' || sortId === 'price_high_low') return 'Price: High to Low';
    const opt = SORT_OPTIONS.find(o => o.id === sortId);
    return opt ? opt.label : 'Recommended';
  };

  const filteredProducts = useMemo(() => {
    // If it's the sales page ("Jewellery to Own"):
    // Show only jewels that have isSale: true. Do not categorise or apply other filters.
    if (isSalePage) {
      return products.filter((product) => Boolean(product.isSale || product.sale || product.sales));
    }

    // Rental page:
    const hasAccessoriesTypeFilter = activeFilters.Type?.some(t => t.toLowerCase() === 'accessories');
    const hasAccessorySubtypeFilter = activeFilters.AccessoryType?.length > 0;
    const showAccessories = hasAccessoriesTypeFilter || hasAccessorySubtypeFilter;
    const hasBanglesFilter = activeFilters.Type?.some(t => t?.toLowerCase() === 'bangles') ||
      activeFilters.Category?.some(c => c?.toLowerCase() === 'bangles');

    return products.filter((product) => {
      // Exclude sale items from rental page
      if (product.isSale || product.sale || product.sales) return false;

      const types = Array.isArray(product.type) ? product.type : [product.type];
      const categories = Array.isArray(product.category) ? product.category : [product.category];

      if (!showAccessories) {
        const isAccessory = Boolean(
          product.accessoryType ||
          types.some(t => t?.toLowerCase() === 'accessories') ||
          categories.some(c => c?.toLowerCase() === 'accessories')
        );
        if (isAccessory) return false;
      }

      if (!hasBanglesFilter) {
        const isBangle = types.some(t => t?.toLowerCase() === 'bangles') ||
          categories.some(c => c?.toLowerCase() === 'bangles');
        if (isBangle) return false;
      }

      if (activeFilters.Category.length > 0) {
        const matchesCategory = activeFilters.Category.some((cat) => {
          if (Array.isArray(product.category)) {
            return product.category.some(c => c?.toLowerCase() === cat.toLowerCase());
          }
          return product.category?.toLowerCase() === cat.toLowerCase();
        });
        if (!matchesCategory) return false;
      }

      if (activeFilters.Colour.length > 0) {
        const matchesColour = activeFilters.Colour.some((col) => {
          if (Array.isArray(product.colour)) {
            return product.colour.some(c => c?.toLowerCase() === col.toLowerCase());
          }
          return product.colour?.toLowerCase() === col.toLowerCase();
        });
        if (!matchesColour) return false;
      }

      if (activeFilters.Occasion.length > 0) {
        const matchesOccasion = product.occasion?.some((occ) =>
          activeFilters.Occasion.some(o => o?.toLowerCase() === occ?.toLowerCase())
        );
        if (!matchesOccasion) return false;
      }

      if (activeFilters.Price.length > 0) {
        const price = product.rentalPrice || product.price || 0;
        const matchesPrice = activeFilters.Price.some((range) => {
          if (range === 'Under ₹1000') return price < 1000;
          if (range === '₹1000 - ₹2000') return price >= 1000 && price <= 2000;
          if (range === '₹2000 - ₹3000') return price >= 2000 && price <= 3000;
          if (range === 'Above ₹3000') return price > 3000;
          return true;
        });
        if (!matchesPrice) return false;
      }

      if (activeFilters.Type.length > 0) {
        const matchesType = activeFilters.Type.some((type) => {
          if (Array.isArray(product.type)) {
            return product.type.some(t => {
              const normT = t?.toLowerCase() || '';
              const normType = type.toLowerCase();
              if (normType.includes('semi bridal') && normT.includes('semi bridal')) return true;
              return normT === normType;
            });
          }
          const normT = product.type?.toLowerCase() || '';
          const normType = type.toLowerCase();
          if (normType.includes('semi bridal') && normT.includes('semi bridal')) return true;
          return normT === normType;
        });
        if (!matchesType) return false;
      }

      if (activeFilters.AccessoryType.length > 0) {
        const types = Array.isArray(product.type) ? product.type : [product.type];
        const isAccessory = types.some(t => t?.toLowerCase() === 'accessories');
        if (!isAccessory || !activeFilters.AccessoryType.some(acc => product.accessoryType?.toLowerCase() === acc.toLowerCase())) return false;
      }

      if (activeFilters.StoneName.length > 0) {
        const matchesStoneName = activeFilters.StoneName.some((stone) => {
          if (Array.isArray(product.stoneName)) {
            return product.stoneName.some(s => s?.toLowerCase() === stone.toLowerCase());
          }
          return product.stoneName?.toLowerCase() === stone.toLowerCase();
        });
        if (!matchesStoneName) return false;
      }

      if (activeFilters.StoneColour.length > 0) {
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
  }, [products, activeFilters, isSalePage]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const getPrice = (item) => (item.isSale ? (item.discountedRate != null ? item.discountedRate : (item.salesAmount || item.salesPrice || 0)) : (item.price || item.rentalPrice || 0));
    if (activeSort === 'newest') {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeSort === 'price_low_high' || activeSort === 'price_asc') {
      return sorted.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (activeSort === 'price_high_low' || activeSort === 'price_desc') {
      return sorted.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (activeSort === 'popularity') {
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
    return sorted;
  }, [filteredProducts, activeSort]);

  return {
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
    setFilters,
    isSalePage
  };
}
