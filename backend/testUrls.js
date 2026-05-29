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
    
    if (upperJewelId.startsWith('AM')) dirsToSearch.push(path.join(uploadsPath, 'AD Mehandi'));
    else if (upperJewelId.startsWith('AG')) dirsToSearch.push(path.join(uploadsPath, 'AD Gold'));
    else if (upperJewelId.startsWith('AS')) dirsToSearch.push(path.join(uploadsPath, 'AD Silver'));

    dirsToSearch = dirsToSearch.filter(dir => fs.existsSync(dir));

    if (dirsToSearch.length === 0) {
      const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
      dirsToSearch = [uploadsPath, ...items.filter(i => i.isDirectory()).map(d => path.join(uploadsPath, d.name))];
    }

    const escapedJewelId = upperJewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedJewelId}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');

    let allMatchedFiles = [];
    for (const dirPath of dirsToSearch) {
      try {
        const files = fs.readdirSync(dirPath);
        const matched = files.filter(file => regex.test(file));
        if (matched.length > 0) {
          const relativeDir = path.relative(uploadsPath, dirPath).replace(/\\/g, '/');
          matched.forEach(file => allMatchedFiles.push({ file, relativeDir }));
        }
      } catch (e) {}
    }

    if (allMatchedFiles.length > 0) {
      allMatchedFiles.sort((aObj, bObj) => {
        const a = aObj.file;
        const b = bObj.file;
        const isBaseA = new RegExp(`^${escapedJewelId}\\.\\w+$`, 'i').test(a);
        const isBaseB = new RegExp(`^${escapedJewelId}\\.\\w+$`, 'i').test(b);
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
        const url = encodeURI(`http://localhost:5000/uploads/${urlPath}`);
        return { type: obj.file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image', url };
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return null;
};

console.log('AM009:', getAutoImages('AM009'));
console.log('AM010:', getAutoImages('AM010'));
