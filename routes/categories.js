const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const categoryController = require('../controllers/categoryController');

router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  categoryController.getAll
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [param('id').isMongoId().withMessage('Invalid category id')],
  validateRequest,
  categoryController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [body('name').notEmpty().withMessage('Category name is required')],
  validateRequest,
  categoryController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [
    param('id').isMongoId().withMessage('Invalid category id'),
    body('name').notEmpty().withMessage('Category name is required'),
  ],
  validateRequest,
  categoryController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid category id')],
  validateRequest,
  categoryController.remove
);

module.exports = router;
