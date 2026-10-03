import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  const activeFilters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
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
    const opt = SORT_OPTIONS.find(o => o.id === sortId);
    return opt ? opt.label : 'Recommended';
  };

  const filteredProducts = useMemo(() => {
    const hasAccessoriesTypeFilter = activeFilters.Type?.some(t => t.toLowerCase() === 'accessories');
    const hasAccessorySubtypeFilter = activeFilters.AccessoryType?.length > 0;
    const showAccessories = hasAccessoriesTypeFilter || hasAccessorySubtypeFilter;

    return products.filter((product) => {
      if (!showAccessories) {
        const types = Array.isArray(product.type) ? product.type : [product.type];
        if (types.some(t => t?.toLowerCase() === 'accessories')) return false;
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
          activeFilters.Occasion.some((selectedOcc) => selectedOcc.toLowerCase() === occ.toLowerCase())
        );
        if (!matchesOccasion) return false;
      }

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

      if (activeFilters.Type.length > 0) {
        const matchesType = activeFilters.Type.some((type) => {
          const normType = type.toLowerCase();
          const checkMatch = (t) => {
            const normT = t?.toLowerCase() || '';
            if (normType.includes('semi bridal') && normT.includes('semi bridal')) return true;
            return normT === normType;
          };
          if (Array.isArray(product.type)) {
            return product.type.some(checkMatch);
          }
          return checkMatch(product.type);
        });
        if (!matchesType) return false;
      }

      if (activeFilters.AccessoryType?.length > 0) {
        const matchesAccType = activeFilters.AccessoryType.some(acc => {
          const pTypes = Array.isArray(product.type) ? product.type : [product.type];
          const isAccessory = pTypes.some(t => t?.toLowerCase() === 'accessories');
          return isAccessory && product.accessoryType?.toLowerCase() === acc.toLowerCase();
        });
        if (!matchesAccType) return false;
      }

      if (activeFilters.StoneName && activeFilters.StoneName.length > 0) {
        const matchesStoneName = activeFilters.StoneName.some((stone) => {
          if (Array.isArray(product.stoneName)) {
            return product.stoneName.some(s => s?.toLowerCase() === stone.toLowerCase());
          }
          return product.stoneName?.toLowerCase() === stone.toLowerCase();
        });
        if (!matchesStoneName) return false;
      }

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
    setFilters
  };
}
