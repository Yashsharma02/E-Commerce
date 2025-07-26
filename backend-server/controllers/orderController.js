const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.placeOrder = async (req, res) => {
  try {
    const { shippingInfo } = req.body;
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    const items = user.cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const total = user.cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = new Order({
      user: user._id,
      items,
      shippingInfo,
      total,
    });

    await order.save();

    // Build email with product names before clearing cart
    const emailHtml = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your purchase, ${user.name}!</p>
      <p>Your order ID: ${order._id}</p>
      <p>Total amount: $${order.total.toFixed(2)}</p>
      <h3>Shipping Info:</h3>
      <p>${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}</p>
      <h3>Order Details:</h3>
      <ul>
        ${user.cart.map(item =>
          `<li>${item.product.name} - Quantity: ${item.quantity}</li>`
        ).join('')}
      </ul>
      <p>We will notify you once your order status changes.</p>
    `;

    await sendEmail(user.email, 'Order Confirmation', emailHtml);

    // Clear user's cart
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};
