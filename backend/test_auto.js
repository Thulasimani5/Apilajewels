const fs = require('fs');
const path = require('path');

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
    }

    dirsToSearch = dirsToSearch.filter(dir => fs.existsSync(dir));

    if (dirsToSearch.length === 0) {
      const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
      dirsToSearch = [uploadsPath, ...items.filter(item => item.isDirectory()).map(dir => path.join(uploadsPath, dir.name))];
    }
    
    console.log('Dirs to search:', dirsToSearch);

    const escapedJewelId = upperJewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedOriginal = originalUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedJewelId === escapedOriginal ? escapedJewelId : `(${escapedJewelId}|${escapedOriginal})`;
    const regex = new RegExp(`^${regexPattern}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
    
    let allMatchedFiles = [];

    for (const dirPath of dirsToSearch) {
      try {
        const files = fs.readdirSync(dirPath);
        const matched = files.filter(file => regex.test(file));
        console.log(`Checking ${dirPath}: found ${matched.length} matches`);
        if (matched.length > 0) {
          const relativeDir = path.relative(uploadsPath, dirPath).replace(/\\/g, '/');
          matched.forEach(file => {
            allMatchedFiles.push({ file, relativeDir });
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    console.log('Matched files:', allMatchedFiles);
  } catch (error) {
    console.error("Error reading directory:", error);
  }
  return null;
};

getAutoImages('PB001');
