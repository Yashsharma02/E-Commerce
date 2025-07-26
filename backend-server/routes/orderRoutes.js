const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', auth, orderController.placeOrder);
router.get('/', auth, orderController.getUserOrders);

module.exports = router;
