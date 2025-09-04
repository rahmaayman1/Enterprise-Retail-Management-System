// services/backupService.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// استدعاء الـ Models اللي عايزين نعمل لهم Backup
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Purchase = require('../models/purchaseModel');
const Ledger = require('../models/ledgerModel');

// فولدر حفظ النسخ الاحتياطية
const backupFolder = path.join(__dirname, '../backups');

// التأكد إن فولدر backups موجود، لو مش موجود يعمله
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder);
}

// دالة عمل نسخة احتياطية
const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {};

    // جلب البيانات من كل Collection
    backupData.users = await User.find().lean();
    backupData.products = await Product.find().lean();
    backupData.purchases = await Purchase.find().lean();
    backupData.ledgers = await Ledger.find().lean();

    // اسم الملف
    const backupFile = path.join(backupFolder, `backup-${timestamp}.json`);

    // كتابة البيانات في ملف JSON
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    logger.info(`✅ Backup created successfully: ${backupFile}`);
    return backupFile;

  } catch (err) {
    logger.error('❌ Backup failed: ' + err.message);
    throw err;
  }
};

module.exports = backupDatabase;
