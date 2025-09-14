// services/backupService.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Purchase = require('../models/purchaseModel');
const Ledger = require('../models/ledgerModel');

// Backup folder
const backupFolder = path.join(__dirname, '../backups');

if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder);
}

// Backup function
const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {};

    backupData.users = await User.find().lean();
    backupData.products = await Product.find().lean();
    backupData.purchases = await Purchase.find().lean();
    backupData.ledgers = await Ledger.find().lean();

    const backupFile = path.join(backupFolder, `backup-${timestamp}.json`);

    // JSON file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    logger.info(`✅ Backup created successfully: ${backupFile}`);
    return backupFile;

  } catch (err) {
    logger.error('❌ Backup failed: ' + err.message);
    throw err;
  }
};

module.exports = backupDatabase;
