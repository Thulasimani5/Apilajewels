const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jewellery = require('./models/Jewellery');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const categoryList = ["Moissanite", "Temple Jewellery", "Antique Jewel", "Kundan", "AD Jewellery", "Polki"];

const designs = [
  { name: 'Bridal Choker Set', type: 'Bridal Set' },
  { name: 'Long Haram Set', type: 'Bridal Set' },
  { name: 'Jhumka Earrings', type: 'Bridal Maid' },
  { name: 'Nakshi Bangle Set', type: 'Designer' },
  { name: 'Royal Rajwadi Necklace', type: 'Reception' },
  { name: 'Designer Kangan Cuff', type: 'Party Wear' },
  { name: 'Traditional Maang Tikka Set', type: 'Small Jewel' },
  { name: 'Precious Chandbali Earrings', type: 'Small Jewel' },
  { name: 'Luxury Pendant Chain Set', type: 'Small Jewel' },
  { name: 'Elegant Mathapatti Set', type: 'Small Jewel' },
  { name: 'Kemp Vanki Armlet', type: 'Small Jewel' },
  { name: 'Grand Rani Haar Set', type: 'Bridal Set' }
];

const categoryMapping = {
  'Temple Jewellery': 'Temple Jewellery',
  'Moissanite': 'Moissanite',
  'Antique': 'Antique Jewel',
  'Kundan': 'Kundan',
  'Polki': 'Polki',
  'AD Stone': 'AD Jewellery'
};

const categorySource = ['Temple Jewellery', 'Moissanite', 'Antique', 'Kundan', 'Polki', 'AD Stone'];

const stonesMap = {
  'Temple Jewellery': ['Ruby', 'Emerald', 'Kemp Stone', 'Pearl'],
  'Moissanite': ['Moissanite', 'Crystal', 'AD Stone'],
  'Antique': ['Ruby', 'Emerald', 'Pearl'],
  'Kundan': ['Kundan', 'Pearl', 'Ruby'],
  'Polki': ['Polki Diamond', 'Emerald', 'Ruby', 'Basra Pearl'],
  'AD Stone': ['AD Stone', 'Cubic Zirconia', 'Crystal']
};

const colourMap = {
  'Temple Jewellery': 'Gold',
  'Moissanite': 'Silver',
  'Antique': 'Gold',
  'Kundan': 'Gold',
  'Polki': 'Mehndi Polish',
  'AD Stone': 'Rose Gold'
};

const finishMap = {
  'Temple Jewellery': 'Antique Gold',
  'Moissanite': 'Silver Polish',
  'Antique': 'Matte Gold Finish',
  'Kundan': 'Gold Plated',
  'Polki': 'Mehndi Polish Antique',
  'AD Stone': 'Rose Gold Polish'
};

const materialMap = {
  'Temple Jewellery': 'Premium Brass Alloy',
  'Moissanite': '925 Sterling Silver',
  'Antique': 'Copper-Brass Alloy',
  'Kundan': 'Brass',
  'Polki': 'Premium Brass',
  'AD Stone': 'Premium Alloy'
};

const imageLibrary = [
  'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  'https://images.unsplash.com/photo-1583391733958-d25e01a88b50?w=800&q=80',
  'https://images.unsplash.com/photo-1595781577436-1e002eb23c21?w=800&q=80'
];

const generateSeederData = () => {
  const dataset = [];
  let currentIdNum = 1001;

  categorySource.forEach((sourceCat) => {
    designs.forEach((designObj, idx) => {
      const jewelId = `PJ${currentIdNum++}`;
      
      let price = 1500 + (idx * 300);
      if (sourceCat === 'Moissanite' || sourceCat === 'Polki') {
        price += 1200;
      } else if (sourceCat === 'AD Stone') {
        price = 900 + (idx * 150);
      }
      
      const deposit = Math.round(price * 0.45);
      const name = `${sourceCat} ${designObj.name}`;
      const stones = stonesMap[sourceCat] || ['AD Stone'];
      
      const img1 = imageLibrary[(idx + sourceCat.length) % imageLibrary.length];
      const img2 = imageLibrary[(idx + sourceCat.length + 1) % imageLibrary.length];

      dataset.push({
        jewelId,
        name,
        category: categoryMapping[sourceCat],
        type: designObj.type,
        price,
        deposit,
        stones: stones.filter(s => ["Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl", "Polki Diamond", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia"].includes(s)),
        colour: colourMap[sourceCat] || 'Gold',
        occasion: idx % 2 === 0 ? ['Bridal', 'Reception', 'Festive'] : ['Engagement', 'Party Wear', 'Festive'],
        material: materialMap[sourceCat] || 'Brass',
        size: idx % 3 === 0 ? 'Free Size' : 'Adjustable',
        finish: finishMap[sourceCat] || 'Antique',
        description: `Exquisite luxury ${name} meticulously crafted with the finest ${stones.join(', ')} elements set in a durable ${materialMap[sourceCat]}. Elegant styling perfect for weddings, high fashion, and special events.`,
        media: [
          { type: 'image', url: img1 },
          { type: 'image', url: img2 }
        ],
        availability: idx !== 4 && idx !== 9,
        popularity: 75 + (idx * 2) + (sourceCat.length)
      });
    });
  });

  return dataset;
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to database to seed...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // Clear existing jewellery
    await Jewellery.deleteMany();
    console.log('Cleared existing jewellery collection.');

    // Drop legacy index code_1 if it exists
    try {
      await Jewellery.collection.dropIndex('code_1');
      console.log('Successfully dropped legacy unique index code_1.');
    } catch (indexError) {
      console.log('No legacy code_1 index to drop, or already removed.');
    }

    // Seed admin user
    const adminEmail = 'apila.jewels@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Apila Admin',
        email: adminEmail,
        phone: '1234567890',
        password: 'apilajewels',
        role: 'admin'
      });
      console.log('Successfully seeded admin user!');
    } else {
      console.log('Admin user already exists.');
    }

    // Generate 72 data items
    const generatedData = generateSeederData();

    // Insert new data
    const inserted = await Jewellery.insertMany(generatedData);
    console.log(`Successfully seeded ${inserted.length} real jewellery items (12 items per category)!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
