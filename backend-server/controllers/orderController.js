const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

exports.placeOrder = async (req, res) => {
  try {
    const { shippingInfo, items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    if (!shippingInfo || Object.values(shippingInfo).some(val => !val)) {
      return res.status(400).json({ message: 'Invalid shipping information.' });
    }

    // Create order for logged-in user
    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      shippingInfo,
      total,
      status: 'pending',
    });

    await order.save();

    // Optional: populate product info for email
    const populatedOrder = await order.populate('items.product').execPopulate();

    // Send order confirmation email
    const emailHtml = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your purchase!</p>
      <p>Order ID: ${order._id}</p>
      <p>Total amount: $${total.toFixed(2)}</p>
      <h3>Shipping Info:</h3>
      <p>
        ${shippingInfo.address}, ${shippingInfo.city}, 
        ${shippingInfo.postalCode}, ${shippingInfo.country}
      </p>
      <h3>Order Details:</h3>
      <ul>
        ${populatedOrder.items.map(
          (item) =>
            `<li>${item.product.name} × ${item.quantity}</li>`
        ).join('')}
      </ul>
    `;

    await sendEmail(req.user.email, 'Order Confirmation', emailHtml);

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
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};
