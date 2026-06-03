const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jewellery = require('./models/Jewellery');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await Jewellery.find({ jewelId: /^AG00/ });
  items.forEach(i => {
    console.log(i.jewelId, i.name);
    console.log(JSON.stringify(i.images, null, 2));
  });
  mongoose.connection.close();
}

check();
