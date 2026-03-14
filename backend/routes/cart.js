const express = require('express');
const router  = express.Router();
const { validateCartItem } = require('../middleware/validate');
const { createError }      = require('../middleware/errorHandler');

// In-memory cart store: { userId -> [{ productId, name, price, quantity }] }
const carts = {};

const getCart = (userId) => carts[userId] || [];

// ── GET /api/cart/:userId ─────────────────────────────────────────────────────
router.get('/:userId', (req, res) => {
  const cart  = getCart(req.params.userId);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ success: true, data: cart, total: parseFloat(total.toFixed(2)) });
});

// ── POST /api/cart/:userId ────────────────────────────────────────────────────
router.post('/:userId', validateCartItem, (req, res, next) => {
  const { userId } = req.params;
  const { productId, name, price, quantity } = req.body;

  if (!carts[userId]) carts[userId] = [];

  const existingIndex = carts[userId].findIndex(i => i.productId === productId);

  if (existingIndex >= 0) {
    carts[userId][existingIndex].quantity += parseInt(quantity);
  } else {
    carts[userId].push({
      productId,
      name:     name     || 'Unknown Product',
      price:    parseFloat(price) || 0,
      quantity: parseInt(quantity),
    });
  }

  const total = carts[userId].reduce((s, i) => s + i.price * i.quantity, 0);
  res.status(201).json({
    success: true,
    data:    carts[userId],
    total:   parseFloat(total.toFixed(2)),
  });
});

// ── PUT /api/cart/:userId/:productId ─────────────────────────────────────────
router.put('/:userId/:productId', (req, res, next) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!carts[userId]) return next(createError('Cart not found', 404));

  const index = carts[userId].findIndex(i => i.productId === productId);
  if (index === -1) return next(createError('Item not in cart', 404));

  if (parseInt(quantity) <= 0) {
    carts[userId].splice(index, 1);
  } else {
    carts[userId][index].quantity = parseInt(quantity);
  }

  const total = carts[userId].reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ success: true, data: carts[userId], total: parseFloat(total.toFixed(2)) });
});

// ── DELETE /api/cart/:userId/:productId ───────────────────────────────────────
router.delete('/:userId/:productId', (req, res, next) => {
  const { userId, productId } = req.params;

  if (!carts[userId]) return next(createError('Cart not found', 404));

  const index = carts[userId].findIndex(i => i.productId === productId);
  if (index === -1) return next(createError('Item not found in cart', 404));

  carts[userId].splice(index, 1);
  res.json({ success: true, message: 'Item removed from cart', data: carts[userId] });
});

// ── DELETE /api/cart/:userId (Clear cart) ────────────────────────────────────
router.delete('/:userId', (req, res) => {
  carts[req.params.userId] = [];
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;