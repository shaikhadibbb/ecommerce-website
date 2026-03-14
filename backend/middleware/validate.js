// ── Generic field validator ───────────────────────────────────────────────────
const validate = (fields) => (req, res, next) => {
  const errors = [];

  fields.forEach(({ name, type, required, min, max, pattern }) => {
    const value = req.body[name];

    if (required && (value === undefined || value === null || value === '')) {
      errors.push(`"${name}" is required`);
      return;
    }

    if (value !== undefined && value !== '') {
      if (type === 'string' && typeof value !== 'string')
        errors.push(`"${name}" must be a string`);

      if (type === 'number' && (isNaN(value) || isNaN(parseFloat(value))))
        errors.push(`"${name}" must be a number`);

      if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errors.push(`"${name}" must be a valid email`);

      if (min !== undefined && String(value).length < min)
        errors.push(`"${name}" must be at least ${min} characters`);

      if (max !== undefined && String(value).length > max)
        errors.push(`"${name}" must be at most ${max} characters`);

      if (pattern && !pattern.test(value))
        errors.push(`"${name}" has an invalid format`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// ── Route-specific validators ─────────────────────────────────────────────────
const validateProduct = validate([
  { name: 'name',        type: 'string', required: true,  min: 2,  max: 100 },
  { name: 'price',       type: 'number', required: true },
  { name: 'description', type: 'string', required: false, max: 500 },
  { name: 'category',    type: 'string', required: true },
  { name: 'stock',       type: 'number', required: false },
]);

const validateUser = validate([
  { name: 'name',     type: 'string', required: true,  min: 2,  max: 50 },
  { name: 'email',    type: 'email',  required: true },
  { name: 'password', type: 'string', required: true,  min: 6,  max: 100 },
]);

const validateCartItem = validate([
  { name: 'productId', type: 'string', required: true },
  { name: 'quantity',  type: 'number', required: true },
]);

const validateOrder = validate([
  { name: 'userId',  type: 'string', required: true },
  { name: 'items',   required: true },
  { name: 'address', type: 'string', required: true, min: 10 },
]);

module.exports = { validate, validateProduct, validateUser, validateCartItem, validateOrder };