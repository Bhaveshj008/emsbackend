const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { name }] 
    });

    if (existingUser) {
      return res.status(409).json({ 
        status: 'duplicate_error',
        message: existingUser.email === email 
          ? 'Email already exists' 
          : 'name already exists'
      });
    }

    if (role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount > 0) {
        return res.status(400).json({ 
          message: 'An admin already exists' 
        });
      }
    }

    if (role === 'MANAGER') {
      const managerCount = await User.countDocuments({ role: 'MANAGER' });
      if (managerCount >= 2) {
        return res.status(400).json({ 
          message: 'Maximum number of managers reached' 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};