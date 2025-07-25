const Order = require('../models/Order');
const User = require('../models/User');

exports.placeOrder = async (req, res) => {
  try {
    const { shippingInfo } = req.body;
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    const items = user.cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    const total = user.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = new Order({
      user: user._id,
      items,
      shippingInfo,
      total,
    });
    await order.save();

    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('items.product');
  res.json(orders);
};
