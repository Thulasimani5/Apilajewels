const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jewellery = require('./models/Jewellery');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await Jewellery.find({ jewelId: /^BA0/ });
  console.log('BA Items:', items.map(i => ({ jewelId: i.jewelId, createdAt: i.createdAt, updatedAt: i.updatedAt })));
  mongoose.connection.close();
}

check();
