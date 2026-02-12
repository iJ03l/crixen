const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const requireAuth = require('../middleware/authMiddleware');

// Helper to validate webhook signature (if HOT Pay provides one, otherwise rely on memo/logic)
// For now, assuming standard REST webhook. 

// POST /api/v1/billing/create-hot-order
router.post('/create-hot-order', requireAuth, async (req, res) => {
    // 1. Get user from request (assuming auth middleware populates req.user)
    // NOTE: If this route is public, we need another way to identify user. 
    // Assuming protected route or email is passed. 
    // For now, let's assume req.user.id exists or we pass userId.
    // If not, for the MVP, we might pass userId in body or rely on auth middleware.

    // Check if auth middleware is used in index.js for this route. 
    // If not, we'll assume a dummy user for now if req.user is missing, OR accept email.

    const userId = req.user?.id || req.body.userId;
    const itemId = req.body.itemId || 'ecbeffd41e7a3619a140093cc011e6bc384970f96e69502d8f50cf95c248f7c5';
    const amount = req.body.amount || '4.99'; // Default or dynamic

    if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
    }

    try {
        // 2. Generate UUID memo
        const memo = uuidv4();

        // 3. Create Order in DB
        const insertOrderQuery = `
            INSERT INTO orders (user_id, memo, amount, status, item_id)
            VALUES ($1, $2, $3, 'pending', $4)
            RETURNING id
        `;
        await db.query(insertOrderQuery, [userId, memo, amount, itemId]);

        // 4. Construct HOT Pay URL
        // https://pay.hot-labs.org/payment?item_id=...&amount=...&memo=...&webhook_url=...
        const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/api/v1/billing/webhook';

        // Ensure webhookUrl is URL encoded
        const redirectUrl = `https://pay.hot-labs.org/payment?item_id=${itemId}&amount=${amount}&memo=${memo}&webhook_url=${encodeURIComponent(webhookUrl)}`;

        res.json({ url: redirectUrl });

    } catch (error) {
        console.error('Error creating HOT order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

// POST /api/v1/billing/create-pingpay-session
router.post('/create-pingpay-session', requireAuth, async (req, res) => {
    const { planId, amount } = req.body;
    const userId = req.user?.id;
    const email = req.user?.email || 'customer@example.com';

    if (!userId || !planId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const pingpayKey = process.env.PINGPAY_PUBLISHABLE_KEY;
        if (!pingpayKey) {
            throw new Error('Server misconfiguration: Missing Pingpay Key');
        }

        // Convert amount to minor units (cents) if Pingpay expects it, 
        // OR standard units. Verify with docs later if this fails.
        // Usually crypto gateways take standard units (e.g. "10.00").
        // Let's assume standard units for now based on "10.00" string.

        const payload = {
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?payment=canceled`,
            customer_email: email,
            client_reference_id: userId, // Pass userId to track who paid
            line_items: [
                {
                    name: `Crixen ${planId} Upgrade`,
                    description: `Monthly subscription for Crixen ${planId} plan`,
                    amount: parseFloat(amount), // Assuming Pingpay handles float amount in USD
                    currency: "USD",
                    quantity: 1
                }
            ],
            metadata: {
                userId: userId.toString(),
                planId: planId
            }
        };

        const response = await fetch('https://pay.pingpay.io/api/checkout/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-publishable-key': pingpayKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Pingpay] Session creation failed:', response.status, errText);
            return res.status(400).json({ message: 'Pingpay provider error', details: errText });
        }

        const data = await response.json();
        // Assuming data.url is the hosted checkout link
        res.json({ url: data.url, sessionId: data.id });

    } catch (error) {
        console.error('[Billing] Pingpay error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/v1/billing/webhook
// HOT Pay calls this when payment succeeds
router.post('/webhook', express.json(), async (req, res) => {
    console.log('[Webhook] Received payload:', req.body);

    const { status, memo } = req.body;

    // 1. Validate status
    if (status !== 'SUCCESS') {
        console.log(`[Webhook] Payment not successful: ${status}`);
        return res.json({ received: true });
    }

    if (!memo) {
        return res.status(400).json({ error: 'Missing memo' });
    }

    try {
        // 2. Find Order by Memo
        const orderResult = await db.query('SELECT * FROM orders WHERE memo = $1', [memo]);

        if (orderResult.rows.length === 0) {
            console.error(`[Webhook] Order not found for memo: ${memo}`);
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // 3. Idempotency Check
        if (order.status === 'paid') {
            console.log(`[Webhook] Order ${order.id} already paid.`);
            return res.json({ received: true });
        }

        // 4. Mark Order as Paid
        await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', order.id]);

        // 5. Determine tier based on amount paid
        let tier = 'pro'; // Default
        const amount = parseFloat(order.amount);
        if (amount >= 100) {
            tier = 'agency';
        } else if (amount >= 10) {
            tier = 'pro';
        }

        // 6. Update User Tier + Set Subscription Expiry (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.query(
            `UPDATE users SET tier = $1, subscription_expires_at = $2, expiry_reminder_sent = FALSE WHERE id = $3`,
            [tier, expiresAt.toISOString(), order.user_id]
        );

        // Create Ticket Record
        await db.query(`
            INSERT INTO tickets (user_id, order_id, ticket_data)
            VALUES ($1, $2, $3)
        `, [order.user_id, order.id, JSON.stringify({ issued_at: new Date(), description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Upgrade`, expires_at: expiresAt })]);

        console.log(`[Webhook] Order ${order.id} processed. User ${order.user_id} upgraded.`);

        res.json({ success: true });

    } catch (error) {
        console.error('[Webhook] Error processing payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
