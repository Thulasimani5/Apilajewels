const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

const account = {
  cloud_name: process.env.CLOUDINARY_1_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_1_API_KEY,
  api_secret: process.env.CLOUDINARY_1_API_SECRET
};

const dirs = [
  '/Users/archana-11724/Downloads/Edited images/AD Silver',
  '/Users/archana-11724/Downloads/Edited images/AD Mehandi',
  '/Users/archana-11724/Downloads/Edited images/AD Gold',
  '/Users/archana-11724/Downloads/zips/AD Silver',
  '/Users/archana-11724/Downloads/zips/AD Mehandi',
  '/Users/archana-11724/Downloads/zips/Ad silver 2',
  '/Users/archana-11724/Documents/ApilaJewels/backend/uploads'
];

function getFilesForId(jewelId) {
  if (!jewelId) return [];
  const norm = jewelId.toUpperCase();
  const alt = norm.replace(/^([A-Z]{2})0([1-9]\d*)$/, '$100$2');
  const short = norm.replace(/^([A-Z]{2})00([1-9]\d*)$/, '$10$2');
  const targets = new Set([norm, alt, short]);
  const matched = new Map();

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    fs.readdirSync(dir).forEach(file => {
      if (!file.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i)) return;
      for (const t of targets) {
        const pattern = new RegExp('^' + t + '(?:[^0-9]|$)', 'i');
        if (pattern.test(file)) {
          // Normalize clean filename (remove duplicate dots like AM015..jpg)
          const cleanName = file.replace(/\.+jpg$/i, '.jpg');
          if (!matched.has(cleanName)) {
            matched.set(cleanName, { file, filePath: path.join(dir, file) });
          }
        }
      }
    });
  }

  return Array.from(matched.values()).sort((a, b) => {
    const numA = (a.file.match(/\((\d+)\)/) || [])[1] || 0;
    const numB = (b.file.match(/\((\d+)\)/) || [])[1] || 0;
    return parseInt(numA, 10) - parseInt(numB, 10);
  });
}

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

async function fixADJewels() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    // 1. Fetch all existing public_ids currently live in Account 1
    console.log('Fetching live Cloudinary Account 1 resources...');
    let livePublicIds = new Set();
    let nextCursor = null;
    do {
      const res = await cloudinary.api.resources({
        cloud_name: account.cloud_name,
        api_key: account.api_key,
        api_secret: account.api_secret,
        max_results: 500,
        next_cursor: nextCursor
      });
      res.resources.forEach(r => livePublicIds.add(r.public_id));
      nextCursor = res.next_cursor;
    } while (nextCursor);

    console.log(`Currently live in Account 1: ${livePublicIds.size} resources.\n`);

    const adItems = await Jewellery.find({ category: 'AD Jewels' });
    console.log(`Found ${adItems.length} AD Jewels items to process.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < adItems.length; i++) {
      const item = adItems[i];
      const localFiles = getFilesForId(item.jewelId);

      if (localFiles.length === 0) {
        console.warn(`[${i + 1}/${adItems.length}] ${item.jewelId}: No local files found.`);
        skippedCount++;
        continue;
      }

      // Check if current DB images for this item are ALL valid in Cloudinary AND count matches local files
      const currentImages = item.images || [];
      const validImagesInCloud = currentImages.filter(img => {
        if (!img.url) return false;
        const match = img.url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
        return match && livePublicIds.has(match[1]);
      });

      // If all local files are already uploaded and live, skip
      if (validImagesInCloud.length === localFiles.length && validImagesInCloud.length === currentImages.length) {
        console.log(`[${i + 1}/${adItems.length}] ${item.jewelId}: All ${validImagesInCloud.length} images already verified & live. Skipping.`);
        continue;
      }

      console.log(`[${i + 1}/${adItems.length}] ${item.jewelId}: Uploading ${localFiles.length} images (was ${validImagesInCloud.length} valid)...`);

      const uploadedImages = [];
      for (const f of localFiles) {
        try {
          const uploaded = await uploadFileWithRetry(f.filePath);
          uploadedImages.push(uploaded);
          // Track the new public_id
          const match = uploaded.url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
          if (match) livePublicIds.add(match[1]);
        } catch (uploadErr) {
          console.error(`  Failed to upload ${f.file}:`, uploadErr.message);
        }
      }

      if (uploadedImages.length > 0) {
        // ONLY update the images array in MongoDB
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: uploadedImages } }
        );
        console.log(`  -> Successfully updated ${item.jewelId} with ${uploadedImages.length} images.`);
        updatedCount++;
      }
    }

    console.log('\n=============================================');
    console.log(`AD Jewels Fix Complete!`);
    console.log(`Items Updated: ${updatedCount}`);
    console.log(`Items Skipped (no files): ${skippedCount}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Fix script failed:', err);
    process.exit(1);
  }
}

fixADJewels();
