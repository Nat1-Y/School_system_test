const pool = require('../config/db');

// Create payment record
const createPayment = async ({ parent_id, parent_name, child_name, month_name, amount, stripe_payment_id, status }) => {
    const query = `
        INSERT INTO "PaymentStripe" (parent_id, parent_name, child_name, month_name, amount, stripe_payment_id, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *;
    `;
    const values = [parent_id, parent_name, child_name, month_name, amount, stripe_payment_id, status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Update payment status
const updatePaymentStatus = async (stripe_payment_id, status) => {
    const query = `
        UPDATE "PaymentStripe" SET status = $1 WHERE stripe_payment_id = $2 RETURNING *;
    `;
    const values = [status, stripe_payment_id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Get payment by Stripe payment id
const getPaymentByStripeId = async (stripe_payment_id) => {
    const query = `SELECT * FROM "PaymentStripe" WHERE stripe_payment_id = $1;`;
    const result = await pool.query(query, [stripe_payment_id]);
    return result.rows[0];
};

module.exports = {
    createPayment,
    updatePaymentStatus,
    getPaymentByStripeId,
}; 