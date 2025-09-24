const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const vendorController = require('../controllers/vendorController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  vendorController.getAll
);

router.get(
  '/active',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  vendorController.getActive
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager', 'Accountant'),
  [param('id').isMongoId().withMessage('Invalid vendor id')],
  validateRequest,
  vendorController.getById
);


router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [body('name').notEmpty().withMessage('Vendor name is required')],
  validateRequest,
  vendorController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid vendor id'),
    body('name').optional().notEmpty().withMessage('name cannot be empty'),
  ],
  validateRequest,
  vendorController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid vendor id')],
  validateRequest,
  vendorController.remove
);

module.exports = router;
