require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Jewellery = require('./models/Jewellery');

  // Fetch all apila_jewels images sorted by created_at
  let all = [];
  let nextCursor = null;
  do {
    const opts = cloudinary.search
      .expression('resource_type:image AND folder:apila_jewels')
      .sort_by('created_at', 'asc')
      .max_results(500);
    if (nextCursor) opts.next_cursor(nextCursor);
    const result = await opts.execute();
    all = all.concat(result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log('Total apila_jewels images:', all.length);

  // Group images uploaded within 10 seconds of each other = same product
  const batches = [];
  let currentBatch = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const prev = new Date(all[i - 1].created_at).getTime();
    const curr = new Date(all[i].created_at).getTime();
    if (curr - prev <= 10000) {
      currentBatch.push(all[i]);
    } else {
      batches.push(currentBatch);
      currentBatch = [all[i]];
    }
  }
  batches.push(currentBatch);

  console.log('Number of batches detected:', batches.length);

  // Build a map: cloudinary public_id (filename part) -> jewelId
  const linked = await Jewellery.find({ 'images.url': /cloudinary/ }).select('jewelId images').sort({ jewelId: 1 });
  const cloudToJewel = {};
  linked.forEach(item => {
    item.images.forEach(img => {
      const pid = img.url.split('/').pop().split('.')[0];
      cloudToJewel[pid] = item.jewelId;
    });
  });

  batches.forEach((batch, idx) => {
    const firstPid = batch[0].public_id.split('/').pop();
    const knownJewelId = cloudToJewel[firstPid];
    const from = batch[0].created_at.substring(11, 19);
    const to = batch[batch.length - 1].created_at.substring(11, 19);
    console.log('Batch ' + (idx + 1) + ': ' + from + '-' + to + ' | ' + batch.length + ' imgs | JewelId: ' + (knownJewelId || '???'));
  });

  mongoose.disconnect();
}

main().catch(console.error);
