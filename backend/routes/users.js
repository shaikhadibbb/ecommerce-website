const express = require('express');
const router  = express.Router();
const { validateUser } = require('../middleware/validate');
const { createError }  = require('../middleware/errorHandler');

// In-memory store (replace with DB + bcrypt later)
let users = [
  { id: '1', name: 'Adib Shaikh', email: 'adib@velvet.com', password: 'hashed_pw', createdAt: new Date().toISOString() },
];

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ success: true, count: safeUsers.length, data: safeUsers });
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', (req, res, next) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return next(createError('User not found', 404));
  const { password, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// ── POST /api/users (Register) ────────────────────────────────────────────────
router.post('/register', validateUser, (req, res, next) => {
  const { name, email, password } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) return next(createError('Email already registered', 409));

  const newUser = {
    id: String(Date.now()),
    name,
    email,
    password, // In production: bcrypt.hash(password, 10)
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: safeUser });
});

// ── POST /api/users/login ─────────────────────────────────────────────────────
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(createError('Email and password are required', 400));

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return next(createError('Invalid email or password', 401));

  const { password: _pw, ...safeUser } = user;
  res.json({ success: true, message: 'Login successful', data: safeUser });
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
router.put('/:id', (req, res, next) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return next(createError('User not found', 404));

  const { password, ...updates } = req.body;
  users[index] = { ...users[index], ...updates };

  const { password: _pw, ...safeUser } = users[index];
  res.json({ success: true, data: safeUser });
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
router.delete('/:id', (req, res, next) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return next(createError('User not found', 404));

  users.splice(index, 1);
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = router;