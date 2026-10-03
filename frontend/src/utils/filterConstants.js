export const INITIAL_FILTER_SECTIONS = {
  Colour: ['Gold', 'Silver', 'Rose Gold', 'Emerald Green', 'Ruby Red', 'Mehndi Polish'],
  Type: [], // Populated dynamically
  Price: ['Under ₹1000', '₹1000 - ₹2000', '₹2000 - ₹3000', 'Above ₹3000'],
  Occasion: ['Bridal Set', 'Bridal Maid', 'Designer', 'Reception', 'Party Wear', 'Small Jewel'],
  StoneName: ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Polki Diamond", "Rose Quartz", "Green Onyx"],
  StoneColour: ["Clear", "Blue", "Pink", "Red", "Green", "Yellow", "White", "Gold", "Various", "Violete", "Orange", "Black", "Purple", "Silver"],
  Category: [], // Populated dynamically
  AccessoryType: ['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories']
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
