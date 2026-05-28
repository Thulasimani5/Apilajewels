const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Setup environment
dotenv.config({ path: path.join(__dirname, '.env') });

const jewellerySchema = new mongoose.Schema({
  jewelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  category: { type: String, required: true },
  type: { type: String, required: true },
  occasion: { type: [String] },
  colour: { type: String },
  media: [{
    type: { type: String, enum: ['image', 'video'] },
    url: { type: String },
    altText: { type: String }
  }],
  availability: { type: Boolean, default: true }
}, { timestamps: true });

const Jewellery = mongoose.model('Jewellery', jewellerySchema);

const categories = ["Moissanite", "Temple Jewellery", "Antique Jewel", "Kundan", "AD Jewellery", "Polki"];
const types = ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"];
const occasions = ["Bridal", "Festive", "Party Wear", "Engagement", "Daily Wear"];
const colours = ["Gold", "Silver", "Rose Gold", "Emerald Green", "Ruby Red", "Mehndi Polish"];

const generateProducts = () => {
  const products = [];
  categories.forEach((cat) => {
    for (let i = 1; i <= 12; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const occasion = occasions[Math.floor(Math.random() * occasions.length)];
      const colour = colours[Math.floor(Math.random() * colours.length)];
      const price = Math.floor(Math.random() * 4000) + 1000;
      
      products.push({
        jewelId: `JWL-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        name: `${cat} ${type} ${i}`,
        description: `Beautiful ${cat} ${type} perfectly suited for ${occasion}. Finished in elegant ${colour}.`,
        price: price,
        deposit: Math.floor(price * 0.2),
        category: cat,
        type: type,
        occasion: [occasion],
        colour: colour,
        images: [{
          type: 'image',
          url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
          altText: `${cat} ${type}`
        }],
        availability: true
      });
    }
  });
  return products;
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apila';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing
    await Jewellery.deleteMany({});
    console.log('Cleared existing jewellery');

    // Insert new
    const products = generateProducts();
    await Jewellery.insertMany(products);
    console.log(`Inserted ${products.length} products (12 for each of the 6 categories)`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
