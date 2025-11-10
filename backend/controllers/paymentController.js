const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const paymentModel = require('../models/paymentModel');

// POST /api/payment/create
const createPayment = async (req, res) => {
    try {
        const { parent_id, parent_name, child_name, month_name, amount } = req.body;
        if (!parent_id || !parent_name || !child_name || !month_name || !amount) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100), // amount in cents
            currency: 'usd',
            metadata: {
                parent_id,
                parent_name,
                child_name,
                month_name
            }
        });
        // Store payment in DB (status: pending)
        await paymentModel.createPayment({
            parent_id,
            parent_name,
            child_name,
            month_name,
            amount,
            stripe_payment_id: paymentIntent.id,
            status: 'pending'
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};

// Webhook to update payment status (optional, for production)
// ...

module.exports = {
    createPayment,
}; 