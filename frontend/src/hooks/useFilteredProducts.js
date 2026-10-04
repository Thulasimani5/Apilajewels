import { useMemo } from 'react';
import { sortJewelleryTypes } from '../utils/filterConstants';

export function useFilteredProducts(products, activeFilters, activeSort, categories) {
  const categoryOptions = useMemo(
    () => categories.filter(c => c.showInSection !== 'type').map(c => c.name),
    [categories]
  );

  const typeOptions = useMemo(() => {
    const opts = categories.filter(c => c.showInSection === 'type').map(c => c.name);
    return sortJewelleryTypes(opts);
  }, [categories]);

  const filtered = useMemo(() => {
    const hasAccessoriesTypeFilter = activeFilters.Type?.some(t => t.toLowerCase() === 'accessories');
    const hasAccessorySubtypeFilter = activeFilters.AccessoryType?.length > 0;
    const showAccessories = hasAccessoriesTypeFilter || hasAccessorySubtypeFilter;

    return products.filter(p => {
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

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (activeSort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeSort === 'price_asc') return arr.sort((a, b) => (a.rentalPrice || a.price || 0) - (b.rentalPrice || b.price || 0));
    if (activeSort === 'price_desc') return arr.sort((a, b) => (b.rentalPrice || b.price || 0) - (a.rentalPrice || a.price || 0));
    if (activeSort === 'popularity') return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return arr;
  }, [filtered, activeSort]);

  return { categoryOptions, typeOptions, sorted };
}
