require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const userRoutes    = require('./routes/users');
const cartRoutes    = require('./routes/cart');
const orderRoutes   = require('./routes/orders');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ message: 'VELVET API is running', version: '2.0.0' });
});

app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  VELVET API running on http://localhost:${PORT}`);
});

module.exports = app;