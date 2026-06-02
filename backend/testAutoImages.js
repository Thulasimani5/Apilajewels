const fs = require('fs');
const path = require('path');

const getAutoImages = (jewelId) => {
  if (!jewelId) return null;

  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) return null;

  try {
    let dirsToSearch = [];
    const upperJewelId = jewelId.toUpperCase();
    if (upperJewelId.startsWith('AM')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Mehandi'));
    } else if (upperJewelId.startsWith('AG')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Gold'));
    } else if (upperJewelId.startsWith('AS')) {
      dirsToSearch.push(path.join(uploadsPath, 'AD Silver'));
    } else if (upperJewelId.startsWith('MP')) {
      dirsToSearch.push(path.join(uploadsPath, 'Mois Polki'));
    } else if (upperJewelId.startsWith('PB')) {
      dirsToSearch.push(path.join(uploadsPath, 'Premium Gold Bridal Jewels'));
    }

    dirsToSearch = dirsToSearch.filter(dir => fs.existsSync(dir));

    if (dirsToSearch.length === 0) {
      const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
      dirsToSearch = [uploadsPath, ...items.filter(i => i.isDirectory()).map(d => path.join(uploadsPath, d.name))];
    }

    const escapedJewelId = jewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

      return allMatchedFiles.map(obj => ({
        type: obj.file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image',
        url: `http://localhost:5000/uploads/${obj.relativeDir ? obj.relativeDir + '/' : ''}${obj.file}`
      }));
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return null;
};

console.log('\n--- AM001 ---');
const r1 = getAutoImages('AM001');
console.log(r1 ? `Found ${r1.length} images` : 'NULL');
if (r1) r1.slice(0,4).forEach(i => console.log(' ', i.url));

console.log('\n--- AM002 ---');
const r2 = getAutoImages('AM002');
console.log(r2 ? `Found ${r2.length} images` : 'NULL');
if (r2) r2.slice(0,4).forEach(i => console.log(' ', i.url));

console.log('\n--- AS001 ---');
const r3 = getAutoImages('AS001');
console.log(r3 ? `Found ${r3.length} images` : 'NULL (no AS folder or files)');
