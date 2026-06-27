const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Jewellery = require('./models/Jewellery');

// Extract jewelId from public_id like "apila_jewels/AM001" or "apila_jewels/subfolder/AM001(1)"
function extractJewelId(public_id) {
  // Get just the last segment of the public_id path
  const parts = public_id.split('/');
  const filename = parts[parts.length - 1];
  // Match patterns like AS001, AM001, PB002 etc.
  const match = filename.match(/^([A-Z]{2,4}\d{1,5})/i);
  return match ? match[1].toUpperCase() : null;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Sample a few public_ids first to check the format
  const sampleResult = await cloudinary.search
    .expression('resource_type:image')
    .max_results(5)
    .execute();
  
  console.log('\nSample public_ids from Cloudinary:');
  sampleResult.resources.forEach(r => {
    console.log(`  public_id: ${r.public_id}  → extracted: ${extractJewelId(r.public_id)}`);
  });

  let nextCursor = null;
  const filesByJewelId = {};

  console.log('\nFetching all images from Cloudinary...');
  do {
    const opts = cloudinary.search
      .expression('resource_type:image')
      .max_results(500);
    
    if (nextCursor) opts.next_cursor(nextCursor);
    
    const result = await opts.execute();

    for (const resource of result.resources) {
      const jewelId = extractJewelId(resource.public_id);
      if (jewelId) {
        if (!filesByJewelId[jewelId]) filesByJewelId[jewelId] = [];
        filesByJewelId[jewelId].push({
          url: resource.secure_url,
          public_id: resource.public_id
        });
      }
    }
    nextCursor = result.next_cursor;
    console.log(`  Fetched batch, total jewel IDs so far: ${Object.keys(filesByJewelId).length}`);
  } while (nextCursor);

  console.log(`\nFound images for ${Object.keys(filesByJewelId).length} unique jewel IDs from Cloudinary.`);

  // Sort images per jewel ID so (1), (2), (3) etc. come in order
  for (const id in filesByJewelId) {
    filesByJewelId[id].sort((a, b) => {
      const matchA = a.public_id.match(/\((\d+)\)/);
      const matchB = b.public_id.match(/\((\d+)\)/);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      if (numA !== numB) return numA - numB;
      return a.public_id.localeCompare(b.public_id);
    });
  }

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const jewelId in filesByJewelId) {
    const item = await Jewellery.findOne({ jewelId: { $regex: new RegExp(`^${jewelId}$`, 'i') } });

    if (!item) {
      notFoundCount++;
      continue;
    }

    const newImages = filesByJewelId[jewelId].map(img => ({
      type: 'image',
      url: img.url
    }));

    // Only update the images field — no other fields touched
    await Jewellery.updateOne(
      { _id: item._id },
      { $set: { images: newImages } }
    );
    console.log(`✔ Updated ${jewelId} → ${newImages.length} image(s)`);
    updatedCount++;
  }

  console.log(`\n✅ Done! Updated: ${updatedCount}, Not found in DB: ${notFoundCount}`);
  mongoose.connection.close();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
