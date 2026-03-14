const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const { createError } = require('../middleware/errorHandler');

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const filter = { isActive: true };

    if (category)  filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) { next(err); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(createError('Product not found', 404));
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return next(createError('Product not found', 404));
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(createError('Product not found', 404));
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

module.exports = router;