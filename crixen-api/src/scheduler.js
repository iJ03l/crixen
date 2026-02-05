/**
 * Crixen Subscription Scheduler
 * 
 * Daily cron job that:
 * 1. Sends 3-day pre-expiry reminder emails
 * 2. Downgrades expired users to starter tier
 */

const cron = require('node-cron');
const db = require('./config/db');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://crixen.xyz';

// Email Templates
function buildExpiryWarningEmail(email, daysLeft, tier) {
    return {
        from: 'Crixen <noreply@crixen.xyz>',
        to: email,
        subject: `Your Crixen ${tier} subscription expires in ${daysLeft} days`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050505;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#0B0C0F;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
                    <tr>
                        <td style="padding:40px 32px;">
                            <h1 style="margin:0 0 32px 0;font-size:24px;font-weight:700;color:#F4F4F4;">Crixen</h1>
                            
                            <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#F4F4F4;">
                                ⏰ Your subscription expires soon
                            </h2>
                            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#A7A7A7;">
                                Your <strong style="color:#F4F4F4;">${tier}</strong> subscription will expire in <strong style="color:#F4F4F4;">${daysLeft} days</strong>. 
                                Renew now to keep unlimited AI generations and all premium features.
                            </p>
                            
                            <a href="${FRONTEND_URL}/billing" style="display:inline-block;padding:14px 28px;background-color:#F4F4F4;color:#050505;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                                Renew Now →
                            </a>
                            
                            <div style="margin:32px 0;height:1px;background:rgba(255,255,255,0.08);"></div>
                            
                            <p style="margin:0;font-size:12px;color:#666;">
                                If you don't renew, your account will be downgraded to the Starter plan after expiry.
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:12px;color:#666;">
                    © ${new Date().getFullYear()} Crixen. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    };
}

function buildExpiryNoticeEmail(email, tier) {
    return {
        from: 'Crixen <noreply@crixen.xyz>',
        to: email,
        subject: `Your Crixen ${tier} subscription has expired`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050505;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#0B0C0F;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
                    <tr>
                        <td style="padding:40px 32px;">
                            <h1 style="margin:0 0 32px 0;font-size:24px;font-weight:700;color:#F4F4F4;">Crixen</h1>
                            
                            <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#F4F4F4;">
                                Your subscription has expired
                            </h2>
                            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#A7A7A7;">
                                Your <strong style="color:#F4F4F4;">${tier}</strong> subscription has ended. 
                                Your account has been moved to the Starter plan with limited features.
                            </p>
                            
                            <p style="margin:0 0 24px 0;font-size:14px;color:#A7A7A7;">
                                <strong style="color:#F4F4F4;">What you're missing:</strong><br>
                                • Unlimited AI generations<br>
                                • Multiple projects<br>
                                • Priority support<br>
                                ${tier === 'agency' ? '• Team collaboration<br>' : ''}
                            </p>
                            
                            <a href="${FRONTEND_URL}/billing" style="display:inline-block;padding:14px 28px;background-color:#F4F4F4;color:#050505;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                                Upgrade Again →
                            </a>
                            
                            <div style="margin:32px 0;height:1px;background:rgba(255,255,255,0.08);"></div>
                            
                            <p style="margin:0;font-size:12px;color:#666;">
                                Your data is safe. Upgrade anytime to restore full access.
                            </p>
                        </td>
                    </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:12px;color:#666;">
                    © ${new Date().getFullYear()} Crixen. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    };
}

// Core Functions
async function processExpiryWarnings() {
    console.log('[Scheduler] Checking for expiry warnings...');

    try {
        // Find users expiring in 3 days or less who haven't been reminded
        const result = await db.query(`
            SELECT id, email, tier, subscription_expires_at
            FROM users
            WHERE subscription_expires_at IS NOT NULL
              AND subscription_expires_at > NOW()
              AND subscription_expires_at <= NOW() + INTERVAL '3 days'
              AND expiry_reminder_sent = FALSE
              AND tier != 'starter'
        `);

        console.log(`[Scheduler] Found ${result.rows.length} users needing expiry warning`);

        for (const user of result.rows) {
            const daysLeft = Math.ceil((new Date(user.subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24));

            try {
                await resend.emails.send(buildExpiryWarningEmail(user.email, daysLeft, user.tier));
                await db.query('UPDATE users SET expiry_reminder_sent = TRUE WHERE id = $1', [user.id]);
                console.log(`[Scheduler] Sent expiry warning to ${user.email} (${daysLeft} days left)`);
            } catch (emailErr) {
                console.error(`[Scheduler] Failed to send warning to ${user.email}:`, emailErr.message);
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error processing expiry warnings:', err);
    }
}

async function processExpiredSubscriptions() {
    console.log('[Scheduler] Checking for expired subscriptions...');

    try {
        // Find expired users who haven't been downgraded yet
        const result = await db.query(`
            SELECT id, email, tier
            FROM users
            WHERE subscription_expires_at IS NOT NULL
              AND subscription_expires_at < NOW()
              AND tier != 'starter'
        `);

        console.log(`[Scheduler] Found ${result.rows.length} expired subscriptions`);

        for (const user of result.rows) {
            try {
                // Downgrade to starter
                await db.query(
                    `UPDATE users SET tier = 'starter', subscription_expires_at = NULL, expiry_reminder_sent = FALSE WHERE id = $1`,
                    [user.id]
                );

                // Send expiry notice
                await resend.emails.send(buildExpiryNoticeEmail(user.email, user.tier));

                console.log(`[Scheduler] Downgraded ${user.email} from ${user.tier} to starter`);
            } catch (err) {
                console.error(`[Scheduler] Failed to process expired user ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error processing expired subscriptions:', err);
    }
}

// Run both checks
async function runDailyCheck() {
    console.log('[Scheduler] Starting daily subscription check...');
    await processExpiryWarnings();
    await processExpiredSubscriptions();
    console.log('[Scheduler] Daily check complete.');
}

// Schedule: Run daily at 9:00 AM UTC
function initScheduler() {
    console.log('[Scheduler] Initializing subscription scheduler...');

    // Run at 9:00 AM UTC every day
    cron.schedule('0 9 * * *', runDailyCheck);

    console.log('[Scheduler] Scheduled daily check at 9:00 AM UTC');

    // Also run immediately on startup (optional, for testing)
    if (process.env.RUN_SCHEDULER_ON_STARTUP === 'true') {
        console.log('[Scheduler] Running initial check on startup...');
        runDailyCheck();
    }
}

module.exports = { initScheduler, runDailyCheck };
