const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const ledgerController = require('../controllers/ledgerController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  ledgerController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  [param('id').isMongoId().withMessage('Invalid ledger id')],
  validateRequest,
  ledgerController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Accountant'),
  [
    body('type').isIn(['debit', 'credit']).withMessage('type must be debit or credit'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be > 0'),
  ],
  validateRequest,
  ledgerController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Accountant'),
  [
    param('id').isMongoId().withMessage('Invalid ledger id'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be > 0'),
  ],
  validateRequest,
  ledgerController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Accountant'),
  [param('id').isMongoId().withMessage('Invalid ledger id')],
  validateRequest,
  ledgerController.remove
);

module.exports = router;
