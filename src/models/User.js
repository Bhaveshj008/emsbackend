const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
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
  timestamps: true 
});

// Ensure unique indexes ignore documents with null or missing values
UserSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { name: { $exists: true, $ne: null } } });
UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null } } });

module.exports = mongoose.model('User', UserSchema);
