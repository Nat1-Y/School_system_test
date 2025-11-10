const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payment/create
router.post('/create', paymentController.createPayment);

module.exports = router; 