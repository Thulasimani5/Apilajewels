const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filesToUpload = [
  'Bridal Set.png',
  'Bridal Maid.png',
  'Designer.png',
  'Reception.png',
  'Party Wear.png',
  'Small Jewel.png',
  'Rental & Delivery Guide.pdf'
];

async function uploadStatic() {
  for (const file of filesToUpload) {
    const localPath = path.resolve(__dirname, '..', 'uploads', file);
    if (fs.existsSync(localPath)) {
      try {
        const res = await cloudinary.uploader.upload(localPath, {
          folder: 'apila_jewels',
          resource_type: 'auto',
          use_filename: true,
          unique_filename: false
        });
        console.log(`✅ Uploaded ${file} to ${res.secure_url}`);
      } catch (err) {
        console.error(`❌ Failed to upload ${file}:`, err);
      }
    } else {
      console.log(`⚠️ File not found: ${localPath}`);
    }
  }
}

uploadStatic();
