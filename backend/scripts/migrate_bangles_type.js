const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const jewellerySchema = new mongoose.Schema({}, { strict: false });
const Jewellery = mongoose.model('Jewellery', jewellerySchema, 'jewelleries');

async function migrate() {
  try {
    const result = await Jewellery.updateMany(
      { type: 'Bangles & Bracelets' },
      { $set: { type: 'Bangles' } }
    );
    console.log(`Updated ${result.modifiedCount} items from 'Bangles & Bracelets' to 'Bangles'.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();
