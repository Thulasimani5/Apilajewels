const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

// Account 5: Bangles & Bracelets and Accessories (x10uudea)
const account = {
  cloud_name: process.env.CLOUDINARY_5_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_5_API_KEY,
  api_secret: process.env.CLOUDINARY_5_API_SECRET
};

const searchDirs = [
  '/Users/archana-11724/Downloads/Edited images/Accessories',
  '/Users/archana-11724/Downloads/zips/Bangles'
];

function getAllMedia() {
  const list = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        walk(p);
      } else if (f.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i)) {
        list.push({ file: f, filePath: p });
      }
    });
  }
  searchDirs.forEach(walk);
  return list;
}

function getFilesForId(jewelId, allMedia) {
  if (!jewelId) return [];
  const norm = jewelId.toUpperCase();
  const alt = norm.replace(/^([A-Z]{1,2})0([1-9]\d*)$/, '$100$2');
  const short = norm.replace(/^([A-Z]{1,2})00([1-9]\d*)$/, '$10$2');
  const noZero = norm.replace(/^([A-Z]{1,2})0+([1-9]\d*)$/, '$1$2');
  const targets = new Set([norm, alt, short, noZero]);

  const matched = new Map();
  for (const m of allMedia) {
    for (const t of targets) {
      const pattern = new RegExp('^' + t + '(?:[^0-9]|$)', 'i');
      if (pattern.test(m.file)) {
        const cleanName = m.file.replace(/\.+jpg$/i, '.jpg');
        if (!matched.has(cleanName)) {
          matched.set(cleanName, m);
        }
        break;
      }
    }
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
      console.warn(`    Retry ${attempt} for ${path.basename(filePath)} (${err.message})...`);
      await new Promise(r => setTimeout(r, attempt * 1500));
    }
  }
};

async function run() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    console.log('Fetching live Cloudinary Account 5 resources...');
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

    console.log(`Currently live on ${account.cloud_name}: ${livePublicIds.size} resources.\n`);

    const allMedia = getAllMedia();
    console.log(`Scanned ${allMedia.length} local media files from Accessories & Bangles.\n`);

    // Find all items mapped to Account 5
    const items = await Jewellery.find({
      $or: [
        { category: 'Bangles & Bracelets' },
        { category: 'Accessories' },
        { accessoryType: { $exists: true, $ne: '', $ne: 'null', $ne: null } },
        { jewelId: /^(BG|BM|BS|GB|BF|EC|ER|HA|HB|MT|R|RB|T\d)/i }
      ]
    });

    console.log(`Found ${items.length} items mapped to Account 5 in MongoDB.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const localFiles = getFilesForId(item.jewelId, allMedia);

      if (localFiles.length === 0) {
        console.warn(`[${i + 1}/${items.length}] ${item.jewelId}: No local files found.`);
        skippedCount++;
        continue;
      }

      const currentImages = item.images || [];
      const validInCloud = currentImages.filter(img => {
        if (!img.url || !img.url.includes(account.cloud_name)) return false;
        const match = img.url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
        return match && livePublicIds.has(match[1]);
      });

      if (validInCloud.length === localFiles.length && validInCloud.length === currentImages.length) {
        console.log(`[${i + 1}/${items.length}] ${item.jewelId}: All ${validInCloud.length} images already live. Skipping.`);
        continue;
      }

      console.log(`[${i + 1}/${items.length}] ${item.jewelId} (${item.name}): Uploading ${localFiles.length} images (was ${validInCloud.length} valid)...`);

      const uploadedImages = [];
      for (const f of localFiles) {
        try {
          const uploaded = await uploadFileWithRetry(f.filePath);
          uploadedImages.push(uploaded);
          const match = uploaded.url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
          if (match) livePublicIds.add(match[1]);
        } catch (err) {
          console.error(`  Failed to upload ${f.file}:`, err.message);
        }
      }

      if (uploadedImages.length > 0) {
        await Jewellery.updateOne(
          { _id: item._id },
          { $set: { images: uploadedImages } }
        );
        console.log(`  -> Successfully updated ${item.jewelId} with ${uploadedImages.length} images in DB.`);
        updatedCount++;
      }
    }

    console.log('\n=============================================');
    console.log(`Accessories & Bangles Upload Complete!`);
    console.log(`Updated: ${updatedCount} items`);
    console.log(`Skipped (no files): ${skippedCount}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

run();
