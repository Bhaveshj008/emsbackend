const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    default: 'EMPLOYEE'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  }
}, { 
  timestamps: true,
  autoIndex: true 
});

// unique indexes
UserSchema.index({ name: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);