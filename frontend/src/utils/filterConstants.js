export const INITIAL_FILTER_SECTIONS = {
  Colour: ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'],
  Type: [], // Populated dynamically
  Price: ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'],
  Occasion: ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'],
  StoneName: ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Polki Diamond", "Rose Quartz", "Green Onyx"],
  StoneColour: ["Clear", "Blue", "Pink", "Red", "Green", "Yellow", "White", "Gold", "Various", "Violete", "Orange", "Black", "Purple", "Silver"],
  Category: [], // Populated dynamically
  AccessoryType: ['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories', 'Bracelet', 'Others']
};

export const SECTION_LABELS = {
  Category: 'CATEGORY',
  Type: 'JEWELLERY TYPE',
  Occasion: 'OCCASION',
  Price: 'PRICE',
  Colour: 'COLOR',
  StoneColour: 'STONE COLOR',
  StoneName: 'STONE'
};

export const SECTION_ORDER = ['Category', 'Type', 'Occasion', 'Price', 'Colour', 'StoneColour', 'StoneName'];

export const ORDERED_JEWELLERY_TYPES = [
  'Full Bridal Set',
  'Semi Bridal & Combo Sets',
  'Long Haram',
  'Choker & Necklace',
  'Bangles',
  'Accessories'
];

export const sortJewelleryTypes = (types = []) => {
  const getSortIndex = (name) => {
    const n = (name || '').toLowerCase().trim();
    if (n.includes('full bridal')) return 0;
    if (n.includes('semi bridal')) return 1;
    if (n.includes('long haram')) return 2;
    if (n.includes('choker') || n.includes('necklace')) return 3;
    if (n.includes('bangle')) return 4;
    if (n.includes('accessor')) return 5;
    const idx = ORDERED_JEWELLERY_TYPES.findIndex(t => t.toLowerCase() === n);
    return idx !== -1 ? idx : 999;
  };

  return [...types].sort((a, b) => {
    const orderA = getSortIndex(a);
    const orderB = getSortIndex(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
};
