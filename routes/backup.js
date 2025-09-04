const express = require('express');
const router = express.Router();

const { createBackup, downloadBackup } = require('../controllers/backupController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// ✅ إنشاء نسخة جديدة
router.post(
  '/create',
  authenticateToken,
  authorizeRoles('Admin'),
  createBackup
);

// ✅ تحميل نسخة موجودة
router.get(
  '/download/:filename',
  authenticateToken,
  authorizeRoles('Admin'),
  downloadBackup
);

module.exports = router;
