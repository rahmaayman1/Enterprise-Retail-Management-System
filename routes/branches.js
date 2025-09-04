const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateMiddleware');
const { body, param } = require('express-validator');

const branchController = require('../controllers/branchController');

// GET /api/branches
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  branchController.getAll
);

// GET /api/branches/:id
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Manager'),
  [param('id').isMongoId().withMessage('Invalid branch id')],
  validateRequest,
  branchController.getById
);

// POST /api/branches
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin'),
  [body('name').notEmpty().withMessage('Branch name is required')],
  validateRequest,
  branchController.create
);

// PUT /api/branches/:id
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [
    param('id').isMongoId().withMessage('Invalid branch id'),
    body('name').notEmpty().withMessage('Branch name is required'),
  ],
  validateRequest,
  branchController.update
);

// DELETE /api/branches/:id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin'),
  [param('id').isMongoId().withMessage('Invalid branch id')],
  validateRequest,
  branchController.remove
);

module.exports = router;
