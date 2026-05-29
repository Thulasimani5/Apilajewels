const fs = require('fs');
const path = require('path');

const uploadsPath = path.join(__dirname, 'uploads', 'AD Mehandi');

// List all files that contain AM010 in their name
const files = fs.readdirSync(uploadsPath);

console.log('=== All AM010* files in AD Mehandi ===');
files.filter(f => f.toUpperCase().includes('AM010')).forEach(f => console.log(' ', f));

console.log('\n=== All AM0010* files in AD Mehandi ===');
files.filter(f => f.toUpperCase().startsWith('AM0010')).forEach(f => console.log(' ', f));

// Test regex for AM010
const jewel = 'AM010';
const escaped = jewel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`^${escaped}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');
console.log('\n=== Regex test for AM010 ===');
console.log('Regex:', regex);
files.filter(f => regex.test(f)).forEach(f => console.log(' MATCH:', f));
console.log('Non-matching AM010x files:');
files.filter(f => f.toUpperCase().startsWith('AM010') && !regex.test(f)).forEach(f => console.log(' SKIP:', f));
