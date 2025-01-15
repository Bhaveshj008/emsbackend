const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/authController');
const { 
  registerValidationRules, 
  validate 
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
  '/register', 
  registerValidationRules(),
  validate,
  registerUser
);

router.post(
  '/login', 
  loginUser
);

router.get(
  '/profile', 
  authMiddleware, 
  getUserProfile
);

module.exports = router;