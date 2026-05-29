const fs = require('fs');
const path = require('path');

const getAutoImages = (jewelId) => {
  if (!jewelId) return null;

  const uploadsPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsPath)) return null;

  try {
    const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
    // Get all subdirectories, and also the root uploads path
    const dirsToSearch = [uploadsPath, ...items.filter(item => item.isDirectory()).map(dir => path.join(uploadsPath, dir.name))];
    
    const escapedJewelId = jewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedJewelId}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
    
    let allMatchedFiles = [];

    for (const dirPath of dirsToSearch) {
      try {
        const files = fs.readdirSync(dirPath);
        const matched = files.filter(file => regex.test(file));
        
        if (matched.length > 0) {
          // Keep track of the relative path from uploads for the URL
          const relativeDir = path.relative(uploadsPath, dirPath).replace(/\\/g, '/');
          matched.forEach(file => {
            allMatchedFiles.push({ file, relativeDir });
          });
        }
      } catch (e) {
        // ignore errors for unreadable dirs
      }
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
        const url = encodeURI(`http://localhost:${process.env.PORT || 5000}/uploads/${urlPath}`);
        const type = obj.file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image';
        return { type, url };
      });
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
  return null;
};

console.log(JSON.stringify(getAutoImages('AM001'), null, 2));
