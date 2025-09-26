const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const stockMovementController = require('../controllers/stockMovementController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Warehouse Staff'),
  stockMovementController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Warehouse Staff'),
  [param('id').isMongoId().withMessage('Invalid movement id')],
  validateRequest,
  stockMovementController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Warehouse Staff'),
  [
    body('product').isMongoId().withMessage('productId is required'),
    body('direction').isIn(['IN', 'OUT']).withMessage('type must be IN or OUT'),
    body('qty').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  ],
  validateRequest,
  stockMovementController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid movement id'),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  stockMovementController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [param('id').isMongoId().withMessage('Invalid movement id')],
  validateRequest,
  stockMovementController.remove
);

module.exports = router;
