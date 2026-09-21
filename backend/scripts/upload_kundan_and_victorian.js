const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');

const accounts = {
  2: {
    cloud_name: process.env.CLOUDINARY_2_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_2_API_KEY,
    api_secret: process.env.CLOUDINARY_2_API_SECRET,
    name: 'Account 2 (wz6zmdta - victorian-moissinate)'
  },
  4: {
    cloud_name: process.env.CLOUDINARY_4_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_4_API_KEY,
    api_secret: process.env.CLOUDINARY_4_API_SECRET,
    name: 'Account 4 (ay9ixzta - Kundan Jewels)'
  }
};

const kundanDirs = [
  '/Users/archana-11724/Downloads/Edited images/Kundan',
  '/Users/archana-11724/Downloads/zips/Kundan'
];

const moisDirs = [
  '/Users/archana-11724/Downloads/Edited images/Mois Polki',
  '/Users/archana-11724/Downloads/zips/Mois Polki',
  '/Users/archana-11724/Downloads/zips/moiss new'
];

function getFiles(jewelId, searchDirs) {
  if (!jewelId) return [];
  const norm = jewelId.toUpperCase();
  const alt = norm.replace(/^([A-Z]{2})0([1-9]\d*)$/, '$100$2');
  const short = norm.replace(/^([A-Z]{2})00([1-9]\d*)$/, '$10$2');
  const targets = new Set([norm, alt, short]);
  const matched = new Map();

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
      const p = path.join(dir, file);
      if (fs.statSync(p).isDirectory()) {
        walk(p);
      } else if (file.match(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i)) {
        for (const t of targets) {
          const pattern = new RegExp('^' + t + '(?:[^0-9]|$)', 'i');
          if (pattern.test(file)) {
            const clean = file.replace(/\.+jpg$/i, '.jpg');
            if (!matched.has(clean)) {
              matched.set(clean, { file, filePath: p });
            }
          }
        }
      }
    });
  }

  searchDirs.forEach(walk);

  return Array.from(matched.values()).sort((a, b) => {
    const numA = (a.file.match(/\((\d+)\)/) || [])[1] || 0;
    const numB = (b.file.match(/\((\d+)\)/) || [])[1] || 0;
    return parseInt(numA, 10) - parseInt(numB, 10);
  });
}

const uploadFileWithRetry = async (account, filePath, retries = 3) => {
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

async function fetchLivePublicIds(account) {
  let live = new Set();
  let nextCursor = null;
  do {
    const res = await cloudinary.api.resources({
      cloud_name: account.cloud_name,
      api_key: account.api_key,
      api_secret: account.api_secret,
      max_results: 500,
      next_cursor: nextCursor
    });
    res.resources.forEach(r => live.add(r.public_id));
    nextCursor = res.next_cursor;
  } while (nextCursor);
  return live;
}

async function processCategory(catName, query, accountIdx, dirs) {
  const account = accounts[accountIdx];
  console.log(`\n=============================================`);
  console.log(`FETCHING LIVE ASSETS FOR ${account.name}...`);
  const livePublicIds = await fetchLivePublicIds(account);
  console.log(`Currently live on ${account.cloud_name}: ${livePublicIds.size} resources.\n`);

  const items = await Jewellery.find(query);
  console.log(`Found ${items.length} items for ${catName}.\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const localFiles = getFiles(item.jewelId, dirs);

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
        const uploaded = await uploadFileWithRetry(account, f.filePath);
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

  console.log(`\n${catName} Complete: ${updatedCount} updated, ${skippedCount} skipped.`);
}

async function run() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas...');

    // 1. Kundan Jewels -> Account 4 (ay9ixzta)
    await processCategory(
      'Kundan Jewels',
      { jewelId: /^PK/i },
      4,
      kundanDirs
    );

    // 2. Victorian-Moissanite -> Account 2 (wz6zmdta)
    await processCategory(
      'Victorian-Moissanite',
      { jewelId: /^MP/i },
      2,
      moisDirs
    );

    console.log('\n=============================================');
    console.log('ALL KUNDAN & VICTORIAN UPLOADS COMPLETED SUCCESSFULLY!');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

run();
