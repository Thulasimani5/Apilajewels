const fs = require('fs');
const path = require('path');

const getAutoImages = (category, jewelId) => {
  if (!category || !jewelId) return null;

  const categoryPath = path.join(__dirname, 'uploads', category);
  
  if (fs.existsSync(categoryPath)) {
    try {
      const files = fs.readdirSync(categoryPath);
      const escapedJewelId = jewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const regex = new RegExp(`^${escapedJewelId}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
      
      let matchedFiles = files.filter(file => regex.test(file));
      
      if (matchedFiles.length > 0) {
        matchedFiles.sort((a, b) => {
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
        
        return matchedFiles.map(file => {
          const url = encodeURI(`http://localhost:${process.env.PORT || 5000}/uploads/${category}/${file}`);
          const type = file.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image';
          return { type, url };
        });
      }
    } catch (error) {
      console.error("Error reading directory:", error);
    }
  } else {
    console.log("Path does not exist:", categoryPath);
  }
  return null;
};

console.log(JSON.stringify(getAutoImages('AD Mehandi', 'AM001'), null, 2));
