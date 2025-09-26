const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const purchaseController = require('../controllers/purchaseController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  purchaseController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  [param('id').isMongoId().withMessage('Invalid purchase id')],
  validateRequest,
  purchaseController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    body('vendor').isMongoId().withMessage('vendorId is required'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.product').isMongoId().withMessage('productId is required'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
    body('items.*.unitCost').isFloat({ gt: 0 }).withMessage('unitPrice must be > 0'),
  ],
  validateRequest,
  purchaseController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid purchase id'),
    body('items').optional().isArray({ min: 1 }),
  ],
  validateRequest,
  purchaseController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid purchase id')],
  validateRequest,
  purchaseController.remove
);

module.exports = router;
