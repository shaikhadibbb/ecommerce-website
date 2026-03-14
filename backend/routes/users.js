const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { createError } = require('../middleware/errorHandler');

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return next(createError('Email already registered', 409));

    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(createError('Email and password required', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.password !== password)
      return next(createError('Invalid email or password', 401));

    const userData = user.toJSON();
    res.json({ success: true, message: 'Login successful', data: userData });
  } catch (err) { next(err); }
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { password, ...updates } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;