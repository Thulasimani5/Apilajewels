const mongoose = require('mongoose');
const Jewellery = require('./models/Jewellery');
require('dotenv').config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apila';

async function deleteAdJewels() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await Jewellery.deleteMany({ stones: 'AD Stone' });
    console.log(`Deleted ${result.deletedCount} AD jewels.`);
  } catch (err) {
    console.error('Error deleting AD jewels:', err);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAdJewels();
