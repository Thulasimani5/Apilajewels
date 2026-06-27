const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // 1. Replace Moissinate Jewels string
  { regex: /'Moissinate Jewels'/g, replacement: "'victorian-moissinate'" },
  { regex: /"Moissinate Jewels"/g, replacement: '"victorian-moissinate"' },
  { regex: /Moissinate Jewels/g, replacement: 'victorian-moissinate' },
  
  // 2. Replace slugs
  { regex: /moissinate-jewels/g, replacement: 'victorian-moissinate' },

  // 3. Remove other categories from arrays (like in footer, home, shop)
  // This is tricky, we can just remove the specific array elements if they appear.
  { regex: /,\s*\{ label:\s*'AD Bangles',[^}]+\}/g, replacement: '' },
  { regex: /,\s*\{ label:\s*'Gold Bangles',[^}]+\}/g, replacement: '' },
  { regex: /,\s*\{ label:\s*'Accessories',[^}]+\}/g, replacement: '' },
  { regex: /\{ label:\s*'AD Bangles',[^}]+\},?/g, replacement: '' },
  { regex: /\{ label:\s*'Gold Bangles',[^}]+\},?/g, replacement: '' },
  { regex: /\{ label:\s*'Accessories',[^}]+\},?/g, replacement: '' },

  { regex: /,\s*'Bangles'/g, replacement: '' },
  { regex: /,\s*'AD Bangles'/g, replacement: '' },
  { regex: /,\s*'Gold Bangles'/g, replacement: '' },
  { regex: /,\s*'Accessories'/g, replacement: '' },
  
  { regex: /'Bangles',\s*/g, replacement: '' },
  { regex: /'AD Bangles',\s*/g, replacement: '' },
  { regex: /'Gold Bangles',\s*/g, replacement: '' },
  { regex: /'Accessories',\s*/g, replacement: '' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      // Specifically fix capitalized ones in SearchOverlay.jsx
      if (content.includes("'MOISSINATE JEWELS'")) {
         content = content.replace(/'MOISSINATE JEWELS'/g, "'VICTORIAN-MOISSINATE'");
         modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Done replacing strings.');
