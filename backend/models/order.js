const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'User is required'],
    },
    items: {
      type:     [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message:   'Order must have at least one item',
      },
    },
    total: {
      type:     Number,
      required: true,
      min:      0,
    },
    address: {
      type:      String,
      required:  [true, 'Delivery address is required'],
      minlength: [10, 'Please provide a complete address'],
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type:    String,
      enum:    ['cod', 'upi', 'card', 'netbanking'],
      default: 'cod',
    },
    paidAt:     { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);