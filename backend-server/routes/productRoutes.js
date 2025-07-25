const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');       // Your JWT authentication middleware
const admin = require('../middleware/adminMiddleware');     // Optional admin authorization middleware

// GET /api/products - Get all products (public access)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: "Server error fetching products" });
  }
});

// POST /api/products - Add a product (protected, admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    // Optional: Add validation for req.body fields here

    const { name, price, description, image, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = new Product({
      name,
      price,
      description: description || "",
      image: image || "",
      category: category || ""
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: "Server error creating product" });
  }
});

module.exports = router;
