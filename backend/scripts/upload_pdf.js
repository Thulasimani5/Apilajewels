const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pdfPath = path.join(__dirname, '../uploads/Rental & Delivery Guide.pdf');

(async () => {
  try {
    console.log('Uploading PDF to Cloudinary with public access...');
    const result = await cloudinary.uploader.upload(pdfPath, {
      resource_type: 'raw',
      folder: 'apila_jewels',
      public_id: 'Rental_Delivery_Guide.pdf',
      overwrite: true,
      type: 'upload',        // ensures public access
      access_mode: 'public', // explicitly mark as public
    });
    console.log('\n✅ Upload successful!');
    console.log('Public URL:', result.secure_url);
    console.log('Resource type:', result.resource_type);
    console.log('Type:', result.type);
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
  }
})();
