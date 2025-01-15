const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { 
  registerValidationRules, 
  validate 
} = require('../middleware/validationMiddleware');


const checkAdminAccess = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};


router.get('/', 
  authMiddleware, 
  checkAdminAccess, 
  getAllUsers
);


router.get('/:id', 
  authMiddleware, 
  checkAdminAccess, 
  getUserById
);


router.post('/', 
  authMiddleware, 
  checkAdminAccess,
  registerValidationRules(),
  validate,
  createUser
);


router.put('/:id', 
  authMiddleware, 
  updateUser
);


router.delete('/:id', 
  authMiddleware, 
  checkAdminAccess, 
  deleteUser
);

module.exports = router;