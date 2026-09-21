const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Jewellery = require('../models/Jewellery');
const Category = require('../models/Category');
const User = require('../models/User');

const backupDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Fetch all jewellery items
    const jewelleryItems = await Jewellery.find({}).lean();
    console.log(`Found ${jewelleryItems.length} jewellery documents.`);

    // Fetch categories
    const categories = await Category.find({}).lean();
    console.log(`Found ${categories.length} category documents.`);

    // Prepare backup folder
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jewelleryBackupFile = path.join(backupDir, `jewellery_backup_${timestamp}.json`);
    const jewelleryLatestFile = path.join(backupDir, `jewellery_backup_latest.json`);
    const fullBackupFile = path.join(backupDir, `full_database_backup_${timestamp}.json`);

    // Write Jewellery JSON
    fs.writeFileSync(jewelleryBackupFile, JSON.stringify(jewelleryItems, null, 2), 'utf-8');
    fs.writeFileSync(jewelleryLatestFile, JSON.stringify(jewelleryItems, null, 2), 'utf-8');

    // Write Full Database JSON
    const fullBackup = {
      timestamp: new Date().toISOString(),
      jewelleryCount: jewelleryItems.length,
      categoryCount: categories.length,
      jewellery: jewelleryItems,
      categories: categories
    };
    fs.writeFileSync(fullBackupFile, JSON.stringify(fullBackup, null, 2), 'utf-8');

    console.log('\n--- BACKUP SUCCESSFUL ---');
    console.log(`Jewellery Backup saved to: ${jewelleryBackupFile}`);
    console.log(`Latest Jewellery Backup saved to: ${jewelleryLatestFile}`);
    console.log(`Full DB Backup saved to: ${fullBackupFile}`);

    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

backupDatabase();
