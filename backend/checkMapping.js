const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Jewellery = require('./models/Jewellery');
  const jewels = await Jewellery.find().select('jewelId images').sort('jewelId');

  console.log('\n=== All DB Jewel IDs and image count ===');
  jewels.forEach(j => console.log(j.jewelId, '| stored images:', j.images.length));

  console.log('\n=== Auto-image test for first 10 ===');
  const uploadsPath = path.join(__dirname, 'uploads');

  for (const j of jewels.slice(0, 10)) {
    const jewelId = j.jewelId;
    const upperJewelId = jewelId.toUpperCase();

    let dirsToSearch = [];
    if (upperJewelId.startsWith('AM')) dirsToSearch.push(path.join(uploadsPath, 'AD Mehandi'));
    else if (upperJewelId.startsWith('AG')) dirsToSearch.push(path.join(uploadsPath, 'AD Gold'));
    else if (upperJewelId.startsWith('AS')) dirsToSearch.push(path.join(uploadsPath, 'AD Silver'));

    dirsToSearch = dirsToSearch.filter(d => fs.existsSync(d));

    const escapedJewelId = jewelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedJewelId}(?![a-zA-Z0-9]).*\\.(jpg|jpeg|png|webp|gif|mp4|mov|avi)$`, 'i');

    let found = 0;
    for (const dirPath of dirsToSearch) {
      const files = fs.readdirSync(dirPath);
      found += files.filter(f => regex.test(f)).length;
    }
    console.log(jewelId, '-> auto-images found:', found);
  }

  process.exit();
});
