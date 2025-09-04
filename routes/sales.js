const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const saleController = require('../controllers/saleController');

// Cashier يقدر يعمل مبيعات
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  saleController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [param('id').isMongoId().withMessage('Invalid sale id')],
  validateRequest,
  saleController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.productId').isMongoId().withMessage('productId is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
    body('paymentMethod').isIn(['cash', 'card', 'digital']).withMessage('Invalid paymentMethod'),
  ],
  validateRequest,
  saleController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid sale id'),
    body('items').optional().isArray({ min: 1 }),
  ],
  validateRequest,
  saleController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid sale id')],
  validateRequest,
  saleController.remove
);

module.exports = router;
