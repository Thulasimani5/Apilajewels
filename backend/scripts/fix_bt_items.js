require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const col = mongoose.connection.db.collection('jewelleries');
  const result = await col.updateMany(
    { jewelId: { $in: ['BT001', 'BT002'] } },
    { $set: { accessoryType: 'Bracelet', category: ['Bangles'] } }
  );
  console.log('Modified count:', result.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
