const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const {createEmployee,  getAllEmployees,  getEmployeeById,  updateEmployee,  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  employeeValidationRules, 
  employeeUpdateValidationRules,
  validate 
} = require('../middleware/validationMiddleware');

// Stats route
router.get('/stats', authMiddleware, asyncHandler(getEmployeeStats));

// Create Employee
router.post(
  '/', 
  authMiddleware, 
  employeeValidationRules(),
  validate,
  asyncHandler(createEmployee)
);

// Get All Employees
router.get('/', authMiddleware, asyncHandler(getAllEmployees));

// Get Employee by ID
router.get('/:id', 
  authMiddleware, 
  param('id').isMongoId().withMessage('Invalid employee ID'),
  validate,
  asyncHandler(getEmployeeById)
);

// Update Employee
router.put(
  '/:id', 
  authMiddleware, 
  employeeUpdateValidationRules(),
  validate,
  asyncHandler(updateEmployee)
);

// Delete Employee
router.delete(
  '/:id', 
  authMiddleware, 
  param('id').isMongoId().withMessage('Invalid employee ID'),
  validate,
  asyncHandler(deleteEmployee)
);

module.exports = router;