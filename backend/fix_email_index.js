/**
 * One-time fix: drop the old non-sparse email_1 index on the users collection
 * so MongoDB rebuilds it as sparse (allowing multiple null emails).
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => ({ name: i.name, key: i.key, sparse: i.sparse })));

    // Drop the old email index if it exists and is not sparse
    const emailIndex = indexes.find(i => i.name === 'email_1');
    if (emailIndex) {
      if (!emailIndex.sparse) {
        await collection.dropIndex('email_1');
        console.log('✅ Dropped old non-sparse email_1 index');
      } else {
        console.log('ℹ️ email_1 index is already sparse, no action needed');
      }
    } else {
      console.log('ℹ️ No email_1 index found');
    }

    // Recreate it as sparse+unique
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Recreated email_1 index as sparse+unique');

    await mongoose.disconnect();
    console.log('Done. You can now register multiple users without an email.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixEmailIndex();
