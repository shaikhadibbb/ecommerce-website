const express = require('express');
const router  = express.Router();
const Cart    = require('../models/Cart');
const { createError } = require('../middleware/errorHandler');

// GET /api/cart/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId })
      .populate('items.product', 'name price image');
    if (!cart) return res.json({ success: true, data: { items: [], total: 0 } });
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// POST /api/cart/:userId — add item
router.post('/:userId', async (req, res, next) => {
  try {
    const { productId, name, price, quantity = 1 } = req.body;
    if (!productId || !price) return next(createError('productId and price required', 400));

    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) cart = new Cart({ user: req.params.userId, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, name, price: Number(price), quantity: Number(quantity) });
    }

    await cart.save();
    res.status(201).json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// PUT /api/cart/:userId/:productId — update quantity
router.put('/:userId/:productId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return next(createError('Cart not found', 404));

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return next(createError('Item not in cart', 404));

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// DELETE /api/cart/:userId/:productId — remove one item
router.delete('/:userId/:productId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return next(createError('Cart not found', 404));

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
});

// DELETE /api/cart/:userId — clear entire cart
router.delete('/:userId', async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return next(createError('Cart not found', 404));
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
});

module.exports = router;