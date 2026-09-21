const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

// Account 3: Gold Antique Jewels (ibt4lpq6)
const account = {
  cloud_name: process.env.CLOUDINARY_3_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_3_API_KEY,
  api_secret: process.env.CLOUDINARY_3_API_SECRET
};

const dir = '/Users/archana-11724/Downloads/Edited images/Gold Bridal Jewels';

const uploadFileWithRetry = async (filePath, retries = 3) => {
  const isVideo = filePath.match(/\.(mp4|mov|avi)$/i);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        cloud_name: account.cloud_name,
        api_key: account.api_key,
        api_secret: account.api_secret,
        folder: 'apila_jewels',
        resource_type: isVideo ? 'video' : 'image',
        timeout: 60000
      });
      return {
        type: isVideo ? 'video' : 'image',
        url: result.secure_url
      };
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`  Retry ${attempt} for ${path.basename(filePath)} (${err.message})...`);
      await new Promise(r => setTimeout(r, attempt * 1500));
    }
  }
};

async function run() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    const targetIds = ['BA010', 'BA014', 'BA015', 'BA016', 'BA017'];
    const allFiles = fs.readdirSync(dir);

    for (const jewelId of targetIds) {
      const pattern = new RegExp('^' + jewelId + '(?:[^0-9]|$)', 'i');
      const files = allFiles
        .filter(f => pattern.test(f) && f.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i))
        .sort((a, b) => {
          const numA = (a.match(/\((\d+)\)/) || [])[1] || 0;
          const numB = (b.match(/\((\d+)\)/) || [])[1] || 0;
          return parseInt(numA, 10) - parseInt(numB, 10);
        });

      console.log(`\n${jewelId}: Uploading ${files.length} images to ${account.cloud_name}...`);

      const uploadedImages = [];
      for (const f of files) {
        const filePath = path.join(dir, f);
        try {
          const uploaded = await uploadFileWithRetry(filePath);
          uploadedImages.push(uploaded);
        } catch (err) {
          console.error(`  Failed to upload ${f}:`, err.message);
        }
      }

      if (uploadedImages.length > 0) {
        await Jewellery.updateOne(
          { jewelId },
          { $set: { images: uploadedImages } }
        );
        console.log(`  -> Successfully updated ${jewelId} with ${uploadedImages.length} images in MongoDB.`);
      }
    }

    console.log('\n=============================================');
    console.log('BA items upload complete!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  }
}

run();
