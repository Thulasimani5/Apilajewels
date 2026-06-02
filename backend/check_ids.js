const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jewellery = require('./models/Jewellery');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await Jewellery.find({}).limit(5);
  console.log('Sample IDs:', items.map(i => ({ _id: i._id, jewelId: i.jewelId })));
  mongoose.connection.close();
}

check();
