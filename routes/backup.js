const express = require('express');
const router = express.Router();

const { createBackup, downloadBackup } = require('../controllers/backupController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post(
  '/create',
  authenticateToken,
  authorizeRoles('Admin'),
  createBackup
);

router.get(
  '/download/:filename',
  authenticateToken,
  authorizeRoles('Admin'),
  downloadBackup
);

module.exports = router;
