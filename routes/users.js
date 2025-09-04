const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const userController = require('../controllers/userController');

// Admin بس اللي يدير المستخدمين
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin'),
  userController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid user id')],
  validateRequest,
  userController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin'),
  [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password >= 6 chars'),
    body('role').isIn(['Admin', 'Manager', 'Accountant', 'Cashier', 'Warehouse Staff'])
      .withMessage('Invalid role'),
  ],
  validateRequest,
  userController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').optional().isIn(['Admin', 'Manager', 'Accountant', 'Cashier', 'Warehouse Staff']),
  ],
  validateRequest,
  userController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid user id')],
  validateRequest,
  userController.remove
);

module.exports = router;
