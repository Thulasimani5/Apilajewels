// ── Admin Dashboard Constants ──────────────────────────────────────────────────
// Static data used throughout the Admin Dashboard. Extracted to prevent
// re-creation on every render and to make editing them easy in one place.

export const OCCASIONS = [
  'Bridal Set',
  'Bridal Maid',
  'Designer',
  'Reception',
  'Party Wear',
  'Small Jewel',
];

export const COLOURS = [
  'Gold',
  'Silver',
  'Rose Gold',
  'Emerald Green',
  'Ruby Red',
  'Mehndi Polish',
];

export const STONE_COLOURS = [
  'Clear',
  'Blue',
  'Pink',
  'Red',
  'Green',
  'Yellow',
  'White',
  'Gold',
  'Various',
  'Violete',
  'Orange',
  'Black',
  'Purple',
  'Silver',
];

export const MATERIALS = [
  'Alloy',
  'Brass',
  'Metal',
  'Zinc Alloy',
  'Copper',
  'Stainless Steel',
];

export const FINISHES = ['Antique', 'Silver', 'Gold', 'Mehandhi'];

export const ACCESSORY_SUBTYPES = [
  'Hip Belt',
  'Ear Rings',
  'Matha Patti',
  'Tikka',
  'Ear Chain',
  'Ring',
  'Ring Bracelet',
  'Hair Accessories',
];

export const DEFAULT_TYPE_NAMES = [
  'Semi Bridal & Combo Sets',
  'Full Bridal Set',
  'Choker & Necklace',
  'Long Haram',
  'Bangles & Bracelets',
  'Accessories',
];

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'inevent', label: 'In Event' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export const PAYMENT_STATUSES = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Partial', label: 'Partial' },
  { value: 'Paid', label: 'Paid' },
];

/** Default empty state for a new booking form */
export const EMPTY_BOOKING_DATA = {
  bookingCustomId: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  bookingPlace: '',
  bookingDate: new Date().toISOString().split('T')[0],
  eventDate: '',
  pickupDate: '',
  returnDate: '',
  discountPercent: 0,
  discountAmount: 0,
  advancePaid: 0,
  depositAmount: 0,
  paymentStatus: 'Pending',
  status: 'pending',
  notes: '',
  jewelleryIds: [],
  tempJewelleries: [],
};

/** Default empty state for a new jewellery form */
export const EMPTY_JEWEL_FORM = {
  jewelId: '',
  name: '',
  description: '',
  price: '',
  deposit: '',
  category: ['victorian-moissinate'],
  accessoryType: '',
  type: [],
  occasion: [],
  colour: 'Gold',
  material: '',
  size: '',
  finish: '',
  purchaseAmount: '',
  rentAmount: '',
  salesAmount: '',
  shopName: '',
  stoneName: [],
  stoneColour: [],
  showPrice: true,
};

/** Default empty state for a temporary jewellery input */
export const EMPTY_TEMP_JEWEL = {
  name: '',
  code: '',
  rentalPrice: '',
  deposit: '',
  image: '',
};
