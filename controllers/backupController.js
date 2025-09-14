const path = require('path');
const fs = require('fs');
const backupService = require('../services/backupService');

// create new backup
const createBackup = async (req, res) => {
  try {
    const filePath = await backupService();
    res.status(200).json({
      message: 'Backup created successfully',
      file: filePath
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backup', details: err.message });
  }
};

// download existing backup
const downloadBackup = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'backups', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath); // Express هيبعت الملف كـ download
  } else {
    res.status(404).json({ error: 'Backup file not found' });
  }
};

module.exports = { createBackup, downloadBackup };
