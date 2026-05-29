const fs = require('fs');
const path = require('path');

// Check all files in AD Mehandi to understand the naming pattern
const uploadsPath = path.join(__dirname, 'uploads', 'AD Mehandi');
const files = fs.readdirSync(uploadsPath);

// Extract unique jewel codes from filenames
const codes = new Set();
files.forEach(f => {
  const m = f.match(/^([A-Z]+\d+)/i);
  if (m) codes.add(m[1]);
});

const sorted = [...codes].sort();
console.log('=== Unique codes found in AD Mehandi folder ===');
sorted.forEach(c => console.log(c));
