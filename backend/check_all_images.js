const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Jewellery = require('./models/Jewellery');

dotenv.config();

const getAutoImages = (jewelId) => {
  if (!jewelId) return null;

  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) return null;

  try {
    let dirsToSearch = [];
    let normalizedId = jewelId;
    if (/^[A-Z]{2}0[1-9]\d$/.test(jewelId)) {
      normalizedId = `${jewelId.slice(0, 2)}0${jewelId.slice(2)}`;
    }
    const upperJewelId = normalizedId.toUpperCase();
    const originalUpper = jewelId.toUpperCase();
    
    if (upperJewelId.startsWith('AM') || originalUpper.startsWith('AM')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Mehandi'));
    } else if (upperJewelId.startsWith('AG') || originalUpper.startsWith('AG')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Gold'));
    } else if (upperJewelId.startsWith('AS') || originalUpper.startsWith('AS')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Silver'));
    } else if (upperJewelId.startsWith('MP') || originalUpper.startsWith('MP')) {
      dirsToSearch.push(path.join(uploadsPath, 'Mois Polki'));
    } else if (upperJewelId.startsWith('PB') || originalUpper.startsWith('PB')) {
      dirsToSearch.push(path.join(uploadsPath, 'Premium Gold Bridal Jewels'));
    }

    dirsToSearch = dirsToSearch.filter(dir => fs.existsSync(dir));

    if (dirsToSearch.length === 0) {
      const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
      dirsToSearch = [uploadsPath, ...items.filter(item => item.isDirectory()).map(dir => path.join(uploadsPath, dir.name))];
    }
    
    const escapedJewelId = upperJewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedOriginal = originalUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedJewelId === escapedOriginal ? escapedJewelId : `(${escapedJewelId}|${escapedOriginal})`;
    const regex = new RegExp(`^${regexPattern}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
    
    let allMatchedFiles = [];

    for (const dirPath of dirsToSearch) {
      try {
        const files = fs.readdirSync(dirPath);
        const matched = files.filter(file => regex.test(file));
        
        if (matched.length > 0) {
          const relativeDir = path.relative(uploadsPath, dirPath).replace(/\\/g, '/');
          matched.forEach(file => {
            allMatchedFiles.push({ file, relativeDir });
          });
        }
      } catch (e) {}
    }

    if (allMatchedFiles.length > 0) {
      allMatchedFiles.sort((aObj, bObj) => {
        const a = aObj.file;
        const b = bObj.file;
        const isBaseA = new RegExp(`^${regexPattern}\\.\\w+$`, 'i').test(a);
        const isBaseB = new RegExp(`^${regexPattern}\\.\\w+$`, 'i').test(b);
        if (isBaseA && !isBaseB) return -1;
        if (!isBaseA && isBaseB) return 1;
        const matchA = a.match(/\((\d+)\)/);
        const matchB = b.match(/\((\d+)\)/);
        const numA = matchA ? parseInt(matchA[1], 10) : 9999;
        const numB = matchB ? parseInt(matchB[1], 10) : 9999;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
      });
      
      return allMatchedFiles.map(obj => {
        const urlPath = obj.relativeDir ? `${obj.relativeDir}/${obj.file}` : obj.file;
        const url = `http://localhost:${process.env.PORT || 5000}/uploads/${urlPath}`;
        const type = obj.file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image';
        return { type, url };
      });
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
  return null;
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const jewels = await Jewellery.find();
  console.log(`Total jewels in DB: ${jewels.length}`);

  let noImagesCount = 0;
  let brokenImagesCount = 0;

  for (const j of jewels) {
    let images = j.images || [];
    const auto = getAutoImages(j.jewelId);
    if (auto && auto.length > 0) {
      images = auto;
    }

    if (images.length === 0) {
      console.log(`[NO IMAGES] ${j.jewelId} | Name: ${j.name} | Category: ${j.category}`);
      noImagesCount++;
    } else {
      // Check if the image files actually exist on disk
      for (const img of images) {
        const url = img.url || img;
        if (typeof url === 'string' && url.includes('/uploads/')) {
          const relativePath = url.split('/uploads/')[1];
          const decodedPath = decodeURI(relativePath);
          const fullPath = path.join(__dirname, 'uploads', decodedPath);
          if (!fs.existsSync(fullPath)) {
            console.log(`[BROKEN IMAGE] ${j.jewelId} | Name: ${j.name} | File missing on disk: ${decodedPath}`);
            brokenImagesCount++;
          }
        }
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Jewels with NO images: ${noImagesCount}`);
  console.log(`- Jewels with BROKEN/MISSING files on disk: ${brokenImagesCount}`);

  mongoose.connection.close();
}

run();
