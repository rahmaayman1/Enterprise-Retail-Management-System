const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Warehouse Staff'),
  productController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Warehouse Staff'),
  [param('id').isMongoId().withMessage('Invalid product id')],
  validateRequest,
  productController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be > 0'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  ],
  validateRequest,
  productController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid product id'),
    body('price').optional().isFloat({ gt: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  productController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [param('id').isMongoId().withMessage('Invalid product id')],
  validateRequest,
  productController.remove
);

module.exports = router;
