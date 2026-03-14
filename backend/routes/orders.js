const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { createError } = require('../middleware/errorHandler');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
});

// GET /api/orders/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) { next(err); }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    if (!order) return next(createError('Order not found', 404));
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// POST /api/orders
router.post('/', async (req, res, next) => {
  try {
    const { user, items, address, paymentMethod } = req.body;
    if (!user || !items || !address)
      return next(createError('user, items and address are required', 400));
    if (!Array.isArray(items) || items.length === 0)
      return next(createError('Order must have at least one item', 400));

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({ user, items, address, total, paymentMethod });
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status))
      return next(createError(`Invalid status. Use: ${VALID_STATUSES.join(', ')}`, 400));

    const update = { status };
    if (status === 'delivered') update.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return next(createError('Order not found', 404));
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Order not found', 404));
    if (['shipped', 'delivered'].includes(order.status))
      return next(createError('Cannot cancel a shipped or delivered order', 400));
    await order.deleteOne();
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) { next(err); }
});

module.exports = router;