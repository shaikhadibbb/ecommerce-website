const express = require('express');
const router  = express.Router();
const { validateOrder } = require('../middleware/validate');
const { createError }   = require('../middleware/errorHandler');

// In-memory orders store
let orders = [];

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({ success: true, count: orders.length, data: orders });
});

// ── GET /api/orders/user/:userId ──────────────────────────────────────────────
router.get('/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json({ success: true, count: userOrders.length, data: userOrders });
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', (req, res, next) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return next(createError('Order not found', 404));
  res.json({ success: true, data: order });
});

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', validateOrder, (req, res, next) => {
  const { userId, items, address } = req.body;

  if (!Array.isArray(items) || items.length === 0)
    return next(createError('Order must contain at least one item', 400));

  const total = items.reduce((sum, item) => {
    if (!item.price || !item.quantity)
      throw createError('Each item must have price and quantity', 400);
    return sum + parseFloat(item.price) * parseInt(item.quantity);
  }, 0);

  const newOrder = {
    id:        String(Date.now()),
    userId,
    items,
    address,
    total:     parseFloat(total.toFixed(2)),
    status:    'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// ── PUT /api/orders/:id/status ────────────────────────────────────────────────
router.put('/:id/status', (req, res, next) => {
  const { status } = req.body;

  if (!status) return next(createError('Status is required', 400));
  if (!VALID_STATUSES.includes(status))
    return next(createError(`Invalid status. Valid: ${VALID_STATUSES.join(', ')}`, 400));

  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return next(createError('Order not found', 404));

  orders[index].status    = status;
  orders[index].updatedAt = new Date().toISOString();

  res.json({ success: true, data: orders[index] });
});

// ── DELETE /api/orders/:id ────────────────────────────────────────────────────
router.delete('/:id', (req, res, next) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (!index === -1) return next(createError('Order not found', 404));

  if (orders[index]?.status === 'shipped' || orders[index]?.status === 'delivered')
    return next(createError('Cannot cancel a shipped or delivered order', 400));

  orders.splice(index, 1);
  res.json({ success: true, message: 'Order cancelled successfully' });
});

module.exports = router;