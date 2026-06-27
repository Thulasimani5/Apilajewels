/**
 * map_cloudinary_to_db.js
 * 
 * Strategy:
 * 1. Fetch ALL Cloudinary images sorted by created_at (upload order)
 * 2. Fetch ALL DB jewellery sorted by jewelId
 * 3. Use the 19 already-linked products as anchor points to determine
 *    how many images each product has and what order they were uploaded
 * 4. From those anchors, extrapolate the mapping for the remaining 145 products
 * 5. Update ONLY the images field in DB — no other fields touched
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Group images by time gap (>10s gap = new product batch)
function groupByBatch(images, gapMs = 10000) {
  if (!images.length) return [];
  const batches = [];
  let current = [images[0]];
  for (let i = 1; i < images.length; i++) {
    const prev = new Date(images[i - 1].created_at).getTime();
    const curr = new Date(images[i].created_at).getTime();
    if (curr - prev <= gapMs) {
      current.push(images[i]);
    } else {
      batches.push(current);
      current = [images[i]];
    }
  }
  batches.push(current);
  return batches;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const Jewellery = require('./models/Jewellery');

  console.log('Fetching all Cloudinary images (sorted by created_at)...');
  let all = [];
  let nextCursor = null;
  do {
    const opts = cloudinary.search
      .expression('resource_type:image AND folder:apila_jewels')
      .sort_by('created_at', 'asc')
      .max_results(500);
    if (nextCursor) opts.next_cursor(nextCursor);
    const result = await opts.execute();
    all = all.concat(result.resources);
    nextCursor = result.next_cursor;
    console.log(`  Fetched ${all.length} images so far...`);
  } while (nextCursor);

  console.log('Total apila_jewels images:', all.length);

  // Group into batches by time gap
  const batches = groupByBatch(all, 10000);
  console.log('Total batches detected:', batches.length);

  // Build cloudinary public_id (filename) -> jewel ID map from already-linked products
  const linked = await Jewellery.find({ 'images.url': /cloudinary/ })
    .select('jewelId images')
    .sort({ jewelId: 1 });

  const pidToJewelId = {};
  linked.forEach(item => {
    item.images.forEach(img => {
      const pid = img.url.split('/').pop().split('.')[0];
      pidToJewelId[pid] = item.jewelId;
    });
  });

  // For each batch, check if any image in it maps to a known jewel ID
  const batchJewelMap = {}; // batchIndex -> jewel ID
  batches.forEach((batch, idx) => {
    for (const img of batch) {
      const pid = img.public_id.split('/').pop();
      if (pidToJewelId[pid]) {
        batchJewelMap[idx] = pidToJewelId[pid];
        break;
      }
    }
  });

  console.log('\nAnchor points (known batch -> jewel ID):');
  Object.keys(batchJewelMap).sort((a, b) => Number(a) - Number(b)).forEach(idx => {
    console.log('  Batch ' + (Number(idx) + 1) + ' -> ' + batchJewelMap[idx] + ' (' + batches[idx].length + ' imgs)');
  });

  // Fetch all DB items sorted by jewel ID (this is the order they were entered / uploaded)
  const allItems = await Jewellery.find().select('jewelId name images').sort({ jewelId: 1 });

  // Build sorted list of all jewel IDs
  const allJewelIds = allItems.map(i => i.jewelId);

  // Get anchor positions in the jewel ID list
  const anchorBatchIndices = Object.keys(batchJewelMap).map(Number).sort((a, b) => a - b);
  const anchorJewelIndices = anchorBatchIndices.map(bIdx => allJewelIds.indexOf(batchJewelMap[bIdx]));

  console.log('\nAnchor mapping (batchIndex -> jewelIdIndex):');
  anchorBatchIndices.forEach((bIdx, i) => {
    console.log('  Batch[' + bIdx + '] -> JewelId[' + anchorJewelIndices[i] + '] = ' + allJewelIds[anchorJewelIndices[i]]);
  });

  // Build the final mapping: for each batch, which jewel does it belong to?
  // Use anchors to interpolate. Between two anchors, batches map sequentially to jewel IDs.
  const batchToJewelId = {};

  // Fill known anchors
  anchorBatchIndices.forEach((bIdx, i) => {
    batchToJewelId[bIdx] = allJewelIds[anchorJewelIndices[i]];
  });

  // Interpolate between anchors
  for (let i = 0; i < anchorBatchIndices.length - 1; i++) {
    const startBatch = anchorBatchIndices[i];
    const endBatch = anchorBatchIndices[i + 1];
    const startJewel = anchorJewelIndices[i];
    const endJewel = anchorJewelIndices[i + 1];

    for (let b = startBatch; b < endBatch; b++) {
      const jewel = startJewel + (b - startBatch);
      if (jewel < endJewel && jewel < allJewelIds.length) {
        batchToJewelId[b] = allJewelIds[jewel];
      }
    }
  }

  // Extrapolate before first anchor
  if (anchorBatchIndices.length > 0) {
    const firstAnchorBatch = anchorBatchIndices[0];
    const firstAnchorJewel = anchorJewelIndices[0];
    for (let b = firstAnchorBatch - 1; b >= 0; b--) {
      const jewel = firstAnchorJewel - (firstAnchorBatch - b);
      if (jewel >= 0) {
        batchToJewelId[b] = allJewelIds[jewel];
      }
    }

    // Extrapolate after last anchor
    const lastAnchorBatch = anchorBatchIndices[anchorBatchIndices.length - 1];
    const lastAnchorJewel = anchorJewelIndices[anchorBatchIndices.length - 1];
    for (let b = lastAnchorBatch + 1; b < batches.length; b++) {
      const jewel = lastAnchorJewel + (b - lastAnchorBatch);
      if (jewel < allJewelIds.length) {
        batchToJewelId[b] = allJewelIds[jewel];
      }
    }
  }

  // Save the mapping to a JSON file for inspection before applying
  const mappingOutput = batches.map((batch, idx) => ({
    batchIndex: idx,
    proposedJewelId: batchToJewelId[idx] || null,
    isAnchor: anchorBatchIndices.includes(idx),
    imageCount: batch.length,
    firstUploadTime: batch[0].created_at,
    urls: batch.map(r => r.secure_url)
  }));

  const outputPath = path.join(__dirname, 'cloudinary_mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(mappingOutput, null, 2));
  console.log('\nMapping saved to cloudinary_mapping.json — review before applying!');
  console.log('Total batches mapped:', Object.keys(batchToJewelId).length, '/', batches.length);

  // Ask confirmation
  console.log('\nTo apply, run: node apply_cloudinary_mapping.js');

  mongoose.disconnect();
}

main().catch(console.error);
