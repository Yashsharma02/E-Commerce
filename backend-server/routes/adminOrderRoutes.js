// routes/adminOrderRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware'); // check user is admin
const Order = require('../models/Order');

// Get all orders for admin
router.get('/', auth, admin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// Update order status
router.put('/:orderId/status', auth, admin, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status;
  await order.save();
  res.json(order);
});

module.exports = router;
