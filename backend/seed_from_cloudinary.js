const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const Jewellery = require('./models/Jewellery');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractJewelId(filename) {
  // e.g. "apila_jewels/AM001(1)" -> "AM001"
  const nameOnly = filename.split('/').pop();
  const match = nameOnly.match(/^([A-Z]+\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

async function getAllCloudinaryImages() {
  let resources = [];
  let next_cursor = null;
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'apila_jewels/',
      max_results: 500,
      next_cursor: next_cursor
    });
    resources = resources.concat(result.resources);
    next_cursor = result.next_cursor;
  } while (next_cursor);
  return resources;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    console.log('Fetching images from Cloudinary...');
    const images = await getAllCloudinaryImages();
    console.log(`Found ${images.length} images in Cloudinary`);

    const filesByJewelId = {};
    for (const img of images) {
      const jewelId = extractJewelId(img.public_id);
      if (!jewelId) continue;
      if (!filesByJewelId[jewelId]) filesByJewelId[jewelId] = [];
      filesByJewelId[jewelId].push({
        url: img.secure_url,
        public_id: img.public_id
      });
    }

    const jewelIds = Object.keys(filesByJewelId);
    console.log(`Grouped into ${jewelIds.length} unique jewel IDs`);

    let updated = 0;
    let notFound = 0;

    for (const jewelId of jewelIds) {
      // Sort images alphabetically by public_id so (1) comes before (2) etc.
      filesByJewelId[jewelId].sort((a, b) => a.public_id.localeCompare(b.public_id));

      const item = await Jewellery.findOne({ jewelId: { $regex: new RegExp(`^${jewelId}$`, 'i') } });
      if (!item) {
        // console.log(`No DB entry for jewelId: ${jewelId}`);
        notFound++;
        continue;
      }

      const newImages = filesByJewelId[jewelId].map(img => ({ type: 'image', url: img.url }));
      item.images = newImages;
      await item.save({ validateBeforeSave: false });
      // console.log(`Updated ${jewelId} with ${newImages.length} images`);
      updated++;
    }

    console.log(`\n✅ Done! Updated products: ${updated}, Products not in DB: ${notFound}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
