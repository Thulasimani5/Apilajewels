const mongoose = require('mongoose');
require('dotenv').config();

async function checkBrokenImages() {
  await mongoose.connect(process.env.MONGO_URI);
  const Jewellery = require('./models/Jewellery');

  // Find items still with localhost URLs
  const localItems = await Jewellery.find({ 'images.url': { $regex: /localhost/ } }).select('name jewelId images');
  console.log(`\n=== Items still with localhost URLs: ${localItems.length} ===`);
  localItems.forEach(item => {
    console.log(`  - ${item.name} (${item.jewelId}): ${item.images.length} images`);
    item.images.forEach(img => console.log(`      ${img.url}`));
  });

  // Find items with NO images at all
  const noImages = await Jewellery.find({ $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] }).select('name jewelId');
  console.log(`\n=== Items with NO images: ${noImages.length} ===`);
  noImages.forEach(item => console.log(`  - ${item.name} (${item.jewelId})`));

  // Quick count
  const total = await Jewellery.countDocuments();
  const withCloudinary = await Jewellery.countDocuments({ 'images.url': { $regex: /cloudinary/ } });
  console.log(`\n=== Summary ===`);
  console.log(`Total items: ${total}`);
  console.log(`Items with Cloudinary URLs: ${withCloudinary}`);
  console.log(`Items still with localhost: ${localItems.length}`);
  console.log(`Items with no images: ${noImages.length}`);

  await mongoose.disconnect();
}

checkBrokenImages().catch(console.error);
