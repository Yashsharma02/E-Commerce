const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get current user's profile
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ name: user.name, email: user.email });
});

// Update current user's profile
router.put('/profile', auth, async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (name) user.name = name;
  if (password && password.length >= 6) user.password = password;
  await user.save();
  res.json({ message: 'Profile updated', name: user.name, email: user.email });
});

module.exports = router;
