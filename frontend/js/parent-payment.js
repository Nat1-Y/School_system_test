// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RpspdDy5YB9eOMTH3FYaNqcGouPFwKuDqX1VY29siWMPOJeXlYS4S09vuRK8Z8ysLsC8oBvj3NLxVW12XOMXXvm00jSypO9ud';
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.getElementById('payment-form');
const paymentMessage = document.getElementById('payment-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  paymentMessage.textContent = '';
  document.getElementById('submitBtn').disabled = true;

  const parent_id = document.getElementById('parent_id').value;
  const parent_name = document.getElementById('parent_name').value;
  const child_name = document.getElementById('child_name').value;
  const month_name = document.getElementById('month_name').value;
  const amount = document.getElementById('amount').value;

  try {
    // 1. Create payment intent on backend
    const res = await fetch('http://localhost:5000/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id, parent_name, child_name, month_name, amount })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned an invalid response.');
    }
    if (!res.ok) throw new Error(data?.message || 'Failed to create payment');

    // 2. Confirm card payment with Stripe.js
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: parent_name }
      }
    });
    if (result.error) {
      paymentMessage.textContent = result.error.message;
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      paymentMessage.style.color = '#16a34a';
      paymentMessage.textContent = 'Payment successful!';
      form.reset();
      cardElement.clear();
    } else {
      paymentMessage.textContent = 'Payment failed. Please try again.';
    }
  } catch (err) {
    paymentMessage.textContent = err.message;
  }
  document.getElementById('submitBtn').disabled = false;
}); 