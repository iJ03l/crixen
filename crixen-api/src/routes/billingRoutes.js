const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const db = require('../config/db'); // In real app

// POST /api/v1/billing/webhook
// Stripe calls this when a payment succeeds
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    letevent;

    try {
        // Verify webhook signature (mocked/skipped if no secret provided for dev)
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const customerEmail = session.customer_details.email;
            console.log(`[Billing] Payment success for ${customerEmail}. Upgrading to PRO.`);

            // TODO: Update user in DB
            // await db.users.update({ tier: 'pro' }, { where: { email: customerEmail } });
            break;

        case 'customer.subscription.deleted':
            const sub = event.data.object;
            console.log(`[Billing] Subscription canceled. Downgrading to STARTER.`);
            // TODO: Downgrade user
            break;

        default:
            console.log(`[Billing] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// POST /api/v1/billing/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
    // For MVP Demo, we return a mock URL or a real Stripe Session URL
    const { priceId } = req.body;

    // Mock for verification without keys
    if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({ url: 'http://localhost:3000/mock-payment-success' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId, // 'price_...'
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'http://localhost:3001/dashboard?success=true',
            cancel_url: 'http://localhost:3001/dashboard?canceled=true',
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
