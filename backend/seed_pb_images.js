require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Jewellery = require('./models/Jewellery');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFolder = path.join(__dirname, 'uploads', 'Premium Gold Bridal Jewels');

function extractJewelId(filename) {
  // filename like PB001(1).jpg or PB001.jpg
  const match = filename.match(/^(PB\d+)/i);
  return match ? match[1].toUpperCase() : null;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    if (!fs.existsSync(uploadFolder)) {
      console.error(`Folder not found: ${uploadFolder}`);
      process.exit(1);
    }

    const files = fs.readdirSync(uploadFolder).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
    console.log(`Found ${files.length} images in local folder.`);

    // Group files by jewelId
    const filesByJewelId = {};
    for (const file of files) {
      const jewelId = extractJewelId(file);
      if (jewelId) {
        if (!filesByJewelId[jewelId]) filesByJewelId[jewelId] = [];
        filesByJewelId[jewelId].push(file);
      }
    }

    console.log(`Grouped into ${Object.keys(filesByJewelId).length} unique jewel IDs.`);

    for (const [jewelId, fileList] of Object.entries(filesByJewelId)) {
      // Sort files: PB001.jpg, then PB001(1).jpg, etc.
      fileList.sort((a, b) => {
        const matchA = a.match(/\((\d+)\)/);
        const matchB = b.match(/\((\d+)\)/);
        const numA = matchA ? parseInt(matchA[1], 10) : 0;
        const numB = matchB ? parseInt(matchB[1], 10) : 0;
        return numA - numB;
      });

      console.log(`\nProcessing ${jewelId} (${fileList.length} images)`);
      
      const item = await Jewellery.findOne({ jewelId: { $regex: new RegExp(`^${jewelId}$`, 'i') } });
      if (!item) {
        console.log(`⚠️ Jewel ID ${jewelId} not found in DB. Skipping.`);
        continue;
      }

      const newImages = [];
      for (const file of fileList) {
        const filePath = path.join(uploadFolder, file);
        console.log(`  Uploading ${file}...`);
        
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'apila_jewels',
            use_filename: true,
            unique_filename: false,
            overwrite: true
          });
          
          newImages.push({
            type: 'image',
            url: result.secure_url
          });
          console.log(`  ✅ Uploaded: ${result.secure_url}`);
        } catch (uploadErr) {
          console.error(`  ❌ Failed to upload ${file}:`, uploadErr.message);
        }
      }

      if (newImages.length > 0) {
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: newImages } }
        );
        console.log(`✔ Updated DB for ${jewelId} with ${newImages.length} images.`);
      }
    }

    console.log('\nAll done!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
    process.exit(1);
  }
}

run();
