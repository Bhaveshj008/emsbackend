const { body, param, validationResult } = require('express-validator');

const employeeValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('mobile')
      .trim()
      .notEmpty().withMessage('Mobile number is required')
      .isMobilePhone().withMessage('Invalid mobile number format'),
    
    body('position')
      .trim()
      .notEmpty().withMessage('Position is required')
      .isIn([
        'Software Engineer', 
        'Project Manager', 
        'HR Manager', 
        'Sales Representative', 
        'Marketing Specialist'
      ]).withMessage('Invalid position selected'),
    
    body('salary')
      .notEmpty().withMessage('Salary is required')
      .isFloat({ min: 100 }).withMessage('Salary must be a greater than 100')
  ];
};

const employeeUpdateValidationRules = () => {
  return [
    param('id').isMongoId().withMessage('Invalid employee ID format'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('salary')
      .optional()
      .isFloat({ min: 0 }).withMessage('Salary must be a positive number')
  ];
};

const registerValidationRules = () => {
    return [
      body('name')
        .trim()
        .notEmpty().withMessage('name is required')
        .isLength({ min: 3, max: 20 }).withMessage('name must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('name can only contain letters, numbers, and underscores'),
  
      body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
  
      body('mobile')
        .trim()
        .notEmpty().withMessage('Mobile number is required')
        .isMobilePhone().withMessage('Invalid mobile number format'),
  
      body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage('Password must include uppercase, lowercase, number, and special character'),
  
      body('role')
        .optional()
        .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Invalid role')
    ];
  };

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return next();
  }

  // Detailed error formatting
  const formattedErrors = errors.array().reduce((acc, error) => {
    if (!acc[error.path]) {
      acc[error.path] = [];
    }
    acc[error.path].push(error.msg);
    return acc;
  }, {});

  // comprehensive error response
  const validationError = new Error('Validation Failed');
  validationError.statusCode = 400;
  validationError.errors = {
    message: 'Validation Failed',
    fields: formattedErrors
  };

  return next(validationError);
};

module.exports = {
  employeeValidationRules,
  employeeUpdateValidationRules,
  registerValidationRules,
  validate
};