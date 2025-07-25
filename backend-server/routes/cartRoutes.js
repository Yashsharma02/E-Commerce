const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.json(user.cart);
});

router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find(item => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }
  await user.save();
  res.json(user.cart);
});

router.delete('/:productId', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
  await user.save();
  res.json(user.cart);
});

module.exports = router;
