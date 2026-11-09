import { useMemo } from 'react';
import { sortJewelleryTypes } from '../utils/filterConstants';

export function useFilteredProducts(products, activeFilters, activeSort, categories) {
  const categoryOptions = useMemo(
    () => categories.filter(c => c.showInSection !== 'type').map(c => c.name),
    [categories]
  );

  // Exclude 'Accessories' from typeOptions — it lives in its own standalone filter section
  const typeOptions = useMemo(() => {
    const opts = categories
      .filter(c => c.showInSection === 'type' && c.name?.toLowerCase() !== 'accessories')
      .map(c => c.name);
    return sortJewelleryTypes(opts);
  }, [categories]);

  const filtered = useMemo(() => {
    const isSalePage = Boolean(activeFilters?.sale);

    // If it's the sales page ("Jewellery to Own"):
    // Show only jewels that have isSale: true. Do not categorise or apply other filters.
    if (isSalePage) {
      return products.filter(p => Boolean(p.isSale || p.sale || p.sales));
    }

    // Rental / Regular shop page:
    // Exclude items that are for sale only
    const hasAccessorySubtypeFilter = activeFilters.AccessoryType?.length > 0;

    return products.filter(p => {
      if (p.isSale || p.sale || p.sales) return false;

      const ptypes = Array.isArray(p.type) ? p.type : [p.type];
      const isAccessoryProduct = ptypes.some(t => t?.toLowerCase() === 'accessories');

      // If AccessoryType filter is active, only show accessories matching the subtype
      if (hasAccessorySubtypeFilter) {
        if (!isAccessoryProduct) return false;
        if (!activeFilters.AccessoryType.some(acc => p.accessoryType?.toLowerCase() === acc.toLowerCase())) return false;
        return true;
      }

      // If no accessory filter, hide all accessory products unless Type filter explicitly includes them
      const typeFilterHasAccessories = activeFilters.Type?.some(t => t?.toLowerCase() === 'accessories');
      if (isAccessoryProduct && !typeFilterHasAccessories && !(activeFilters.Type?.length === 0)) {
        // only hide if there IS a Type filter that doesn't include accessories
        return false;
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
    const getPrice = p => (p.isSale ? (p.discountedRate != null ? p.discountedRate : (p.salesAmount || p.salesPrice || 0)) : (p.rentalPrice || p.price || 0));
    if (activeSort === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeSort === 'price_asc' || activeSort === 'price_low_high') return arr.sort((a, b) => getPrice(a) - getPrice(b));
    if (activeSort === 'price_desc' || activeSort === 'price_high_low') return arr.sort((a, b) => getPrice(b) - getPrice(a));
    if (activeSort === 'popularity') return arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return arr;
  }, [filtered, activeSort]);

  return { categoryOptions, typeOptions, sorted };
}
