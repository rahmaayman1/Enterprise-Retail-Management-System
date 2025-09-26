const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const saleController = require('../controllers/saleController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  saleController.getAll
);

router.get(
  '/today',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  saleController.getTodaySales
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
    body('items.*.product').isMongoId().withMessage('product is required'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('qty must be >= 1'),
    body('items.*.unitPrice').isNumeric().withMessage('unitPrice is required'),
    body('paymentMethod').isIn(['CASH', 'CARD', 'TRANSFER', 'MIXED']).withMessage('Invalid paymentMethod'),
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
