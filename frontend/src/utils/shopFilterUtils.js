export const FILTER_KEYS = ['Category', 'Type', 'Occasion', 'Price', 'Colour', 'StoneName', 'StoneColour', 'Stone', 'AccessoryType'];

export const filtersFromParams = (params) => {
  const result = {};
  FILTER_KEYS.forEach(key => { result[key] = params.getAll(key); });
  return result;
};

export const buildParams = (filters, sort, page) => {
  const p = new URLSearchParams();
  FILTER_KEYS.forEach(key => {
    (filters[key] || []).forEach(v => p.append(key, v));
  });
  if (sort && sort !== 'recommended') p.set('sort', sort);
  if (page && page > 1) p.set('page', String(page));
  return p;
};

export const bootstrapFromLegacyParams = (searchParams, categories) => {
  if (FILTER_KEYS.some(k => searchParams.has(k))) return null;
  const categoryParam = searchParams.get('category');
  const occasionParam = searchParams.get('occasion');
  if (!categoryParam && !occasionParam) return null;

  const occasionMap = {
    bridal: 'Bridal Set', 'bridal-set': 'Bridal Set', 'bridal-maid': 'Bridal Maid',
    bridesmaid: 'Bridal Maid', designer: 'Designer', 'designer-collection': 'Designer',
    reception: 'Reception', 'reception-jewels': 'Reception', party: 'Party Wear',
    'party-wear': 'Party Wear', small: 'Small Jewel', 'small-jewel': 'Small Jewel', 'small-jewels': 'Small Jewel',
  };

  const typeMap = {
    'bridal-set': 'Bridal Set', 'bridal-maid': 'Bridal Maid', 'designer': 'Designer',
    'reception': 'Reception', 'party-wear': 'Party Wear', 'small-jewel': 'Small Jewel',
    'small-jewels': 'Small Jewel', 'semi-bridal': 'Semi Bridal & Combo Sets',
    'choker-necklace': 'Choker & Necklace', 'long-haram': 'Long Haram',
    'full-bridal': 'Full Bridal Set', 'accessories': 'Accessories',
    'bangles-bracelets': 'Bangles', 'bangles-and-bracelets': 'Bangles',
    'bangles': 'Bangles', 'gold-bangles': 'Bangles',
    'bracelets': 'Accessories'
  };

  const filters = { Category: [], Type: [], Occasion: [], Price: [], Colour: [], StoneName: [], StoneColour: [], Stone: [], AccessoryType: [] };

  if (occasionParam) {
    const norm = occasionParam.toLowerCase();
    const v = occasionMap[norm];
    if (v) filters.Occasion.push(v);
    else if (typeMap[norm]) filters.Occasion.push(typeMap[norm]);
  }

  if (categoryParam) {
    const norm = categoryParam.toLowerCase();
    if (typeMap[norm]) {
      filters.Type.push(typeMap[norm]);
    } else {
      const matched = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === norm || c.name.toLowerCase() === norm);
      if (matched) {
        if (matched.showInSection === 'type') {
          filters.Type.push(matched.name);
        } else {
          filters.Category.push(matched.name);
        }
      } else if (norm === 'victorian-moissinate' || norm === 'moissanite' || norm === 'moissinate') {
        filters.Category.push('victorian-moissinate');
      } else if (norm.includes('temple')) {
        filters.Category.push('Temple Jewellery');
      } else if (norm === 'kundan' || norm === 'kundan-jewels') {
        filters.Category.push('Kundan Jewels');
      } else if (norm === 'american-diamond' || norm === 'ad-jewels') {
        filters.Category.push('AD Jewels');
      } else if (norm.includes('antique') || norm === 'gold-antique-jewels') {
        filters.Category.push('Gold Antique Jewels');
      } else if (norm === 'polki') {
        filters.Category.push('Polki');
      } else {
        filters.Category.push(categoryParam);
      }
    }
  }

  return filters;
};

// Aliases for desktop
export const DESKTOP_FILTER_KEYS = FILTER_KEYS;
export const desktopFiltersFromParams = filtersFromParams;
export const desktopBuildParams = buildParams;
export const desktopBootstrapLegacy = bootstrapFromLegacyParams;
