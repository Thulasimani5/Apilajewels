const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');
const Category = require('../models/Category');

const restoreDatabase = async () => {
  try {
    const fileArg = process.argv[2];
    const backupFilePath = fileArg || path.join(__dirname, '../backups/jewellery_backup_latest.json');

    if (!fs.existsSync(backupFilePath)) {
      console.error(`Backup file not found at: ${backupFilePath}`);
      process.exit(1);
    }

    console.log(`Reading backup file from: ${backupFilePath}`);
    const fileData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));

    await connectDB();
    console.log('Connected to MongoDB...');

    let jewelleryItems = [];
    if (Array.isArray(fileData)) {
      jewelleryItems = fileData;
    } else if (fileData.jewellery && Array.isArray(fileData.jewellery)) {
      jewelleryItems = fileData.jewellery;
      if (fileData.categories && Array.isArray(fileData.categories)) {
        console.log(`Restoring ${fileData.categories.length} categories...`);
        for (const cat of fileData.categories) {
          const catId = cat._id;
          delete cat._id;
          await Category.findByIdAndUpdate(catId, cat, { upsert: true, new: true });
        }
      }
    }

    console.log(`Restoring ${jewelleryItems.length} jewellery items...`);

    let restoredCount = 0;
    for (const item of jewelleryItems) {
      const { _id, ...updateData } = item;
      if (_id) {
        await Jewellery.findByIdAndUpdate(_id, updateData, { upsert: true, new: true, runValidators: false });
      } else if (item.jewelId) {
        await Jewellery.findOneAndUpdate({ jewelId: item.jewelId }, updateData, { upsert: true, new: true, runValidators: false });
      } else {
        await Jewellery.create(item);
      }
      restoredCount++;
    }

    console.log(`\n--- RESTORE SUCCESSFUL ---`);
    console.log(`Restored/updated ${restoredCount} documents in MongoDB.`);

    process.exit(0);
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
};

restoreDatabase();
