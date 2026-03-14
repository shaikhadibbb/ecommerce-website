const express = require('express');
const router  = express.Router();
const { validateProduct } = require('../middleware/validate');
const { createError }     = require('../middleware/errorHandler');

// In-memory store (replace with DB later)
let products = [
  { id: '1', name: 'Silk Noir Blazer',     price: 8999,  category: 'clothing',     stock: 10, description: 'Premium silk blazer in classic noir.' },
  { id: '2', name: 'Velvet Clutch Bag',    price: 4599,  category: 'accessories',  stock: 25, description: 'Evening clutch in plush velvet.' },
  { id: '3', name: 'Gold Leaf Pendant',    price: 3299,  category: 'jewellery',    stock: 15, description: '18k gold-plated leaf pendant.' },
];

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;
  let result = [...products];

  if (category) result = result.filter(p => p.category === category);
  if (minPrice)  result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice)  result = result.filter(p => p.price <= Number(maxPrice));
  if (search)    result = result.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()));

  res.json({ success: true, count: result.length, data: result });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(createError('Product not found', 404));
  res.json({ success: true, data: product });
});

// ── POST /api/products ────────────────────────────────────────────────────────
router.post('/', validateProduct, (req, res) => {
  const { name, price, description, category, stock } = req.body;
  const newProduct = {
    id: String(Date.now()),
    name,
    price: parseFloat(price),
    description: description || '',
    category,
    stock: parseInt(stock) || 0,
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
router.put('/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(createError('Product not found', 404));

  products[index] = { ...products[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: products[index] });
});

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
router.delete('/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(createError('Product not found', 404));

  products.splice(index, 1);
  res.json({ success: true, message: 'Product deleted successfully' });
});

module.exports = router;