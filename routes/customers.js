const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const customerController = require('../controllers/customerController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  customerController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [param('id').isMongoId().withMessage('Invalid customer id')],
  validateRequest,
  customerController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [body('name').notEmpty().withMessage('Customer name is required')],
  validateRequest,
  customerController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Cashier'),
  [
    param('id').isMongoId().withMessage('Invalid customer id'),
    body('name').notEmpty().withMessage('Customer name is required'),
  ],
  validateRequest,
  customerController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid customer id')],
  validateRequest,
  customerController.remove
);

module.exports = router;
