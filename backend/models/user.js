const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    address: {
      type:    String,
      default: '',
    },
    phone: {
      type:    String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hide password when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);