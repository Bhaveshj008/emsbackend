const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must not exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      message: 'Invalid role selected'
    },
    default: 'EMPLOYEE'
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: {
      values: [
        'Software Engineer', 
        'Project Manager', 
        'HR Manager', 
        'Sales Representative', 
        'Marketing Specialist',
        'Admin',
        'Manager'
      ],
      message: 'Invalid position selected'
    }
  },
  department: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary must be a positive number']
  },
  permissions: {
    canCreateEmployee: {
      type: Boolean,
      default: false
    },
    canUpdateEmployee: {
      type: Boolean,
      default: false
    },
    canDeleteEmployee: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  profileImage: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  autoIndex: true 
});


EmployeeSchema.pre('save', async function(next) {
  
  if (!this.isModified('password')) return next();

  try {
   
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});


EmployeeSchema.pre('save', async function(next) {
  // Limit admin to one user
  if (this.role === 'ADMIN') {
    const adminCount = await this.constructor.countDocuments({ role: 'ADMIN' });
    if (adminCount > 0 && this.isNew) {
      return next(new Error('Only one admin is allowed'));
    }
  }

  // Limit managers to two
  if (this.role === 'MANAGER') {
    const managerCount = await this.constructor.countDocuments({ role: 'MANAGER' });
    if (managerCount >= 2 && this.isNew) {
      return next(new Error('Maximum two managers are allowed'));
    }
  }

  // permissions based on role
  if (this.role === 'ADMIN') {
    this.permissions = {
      canCreateEmployee: true,
      canUpdateEmployee: true,
      canDeleteEmployee: true,
      canManageUsers: true
    };
  } else if (this.role === 'MANAGER') {
    this.permissions = {
      canCreateEmployee: true,
      canUpdateEmployee: true,
      canDeleteEmployee: false,
      canManageUsers: false
    };
  } else {
    this.permissions = {
      canCreateEmployee: false,
      canUpdateEmployee: false,
      canDeleteEmployee: false,
      canManageUsers: false
    };
  }

  next();
});

// Method to compare password
EmployeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create unique indexes
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ mobile: 1 }, { unique: true });

// Static method to check if admin exists
EmployeeSchema.statics.adminExists = async function() {
  const adminCount = await this.countDocuments({ role: 'ADMIN' });
  return adminCount > 0;
};

module.exports = mongoose.model('Employee', EmployeeSchema);