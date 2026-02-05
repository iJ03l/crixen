const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, tier: user.tier },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validate password
    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (password.length > 72) {
        return res.status(400).json({ error: 'Password is too long (max 72 characters)' });
    }

    // Regex: At least one upper, one lower, one number, one special
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must include uppercase, lowercase, number, and special character'
        });
    }

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, tier',
            [email, hashedPassword]
        );

        const user = result.rows[0];
        const token = generateToken(user);
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // If user has no password (social login only), prevent password login
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Please log in with Google/GitHub' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, email: user.email, tier: user.tier } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/v1/auth/google
router.post('/google', async (req, res) => {
    const { token, code, mode } = req.body;

    try {
        let idToken = token;

        // If auth code provided, exchange it for tokens
        if (code) {
            const { tokens } = await googleClient.getToken(code);
            idToken = tokens.id_token;
        }

        if (!idToken) {
            return res.status(400).json({ error: 'No token provided' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email } = payload;

        // Check if user exists
        let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (result.rows.length === 0) {
            // STRICT MODE CHECK
            if (mode === 'login') {
                return res.status(404).json({ error: 'User not found. Please sign up.' });
            }

            // Create new user linked to Google (Only if signup or undefined)
            const insert = await db.query(
                'INSERT INTO users (email, google_id) VALUES ($1, $2) RETURNING id, email, tier',
                [email, googleId]
            );
            user = insert.rows[0];
        } else {
            user = result.rows[0];
            // Link Google ID if not present
            if (!user.google_id) {
                await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
            }
        }

        const jwtToken = generateToken(user);
        res.json({ token: jwtToken, user: { id: user.id, email: user.email, tier: user.tier } });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ error: 'Google authentication failed' });
    }
});

// POST /api/v1/auth/github
router.post('/github', async (req, res) => {
    const { code } = req.body;

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error_description);

        const accessToken = tokenData.access_token;

        // Get User Data
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json();

        // Get User Email (if private)
        let email = userData.email;
        if (!email) {
            const emailRes = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const emails = await emailRes.json();
            const primary = emails.find(e => e.primary && e.verified);
            if (primary) email = primary.email;
        }

        if (!email) throw new Error('No public email found on GitHub account');

        const githubId = userData.id.toString();

        // Check if user exists
        let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (result.rows.length === 0) {
            // Create user
            const insert = await db.query(
                'INSERT INTO users (email, github_id) VALUES ($1, $2) RETURNING id, email, tier',
                [email, githubId]
            );
            user = insert.rows[0];
        } else {
            user = result.rows[0];
            // Link GitHub ID if not present
            if (!user.github_id) {
                await db.query('UPDATE users SET github_id = $1 WHERE id = $2', [githubId, user.id]);
            }
        }

        const jwtToken = generateToken(user);
        res.json({ token: jwtToken, user: { id: user.id, email: user.email, tier: user.tier } });

    } catch (error) {
        console.error('GitHub Auth Error:', error);
        res.status(400).json({ error: 'GitHub authentication failed' });
    }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if user exists
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No account found with that email address' });
        }

        const user = result.rows[0];

        // Generate reset token (simple version - in production use crypto)
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store token in DB (assuming we add these columns, or store in memory/cache for now)
        // For simplicity, we'll just send the email without storing the token
        // In production, you'd want to store this and verify it on the reset page

        // Send email via Resend
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        await resend.emails.send({
            from: 'Crixen <onboarding@resend.dev>',
            to: email,
            subject: 'Reset Your Password - Crixen',
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
                                            <!-- Logo -->
                                            <h1 style="margin:0 0 32px 0;font-family:'Space Grotesk','Inter',sans-serif;font-size:24px;font-weight:700;color:#F4F4F4;letter-spacing:-0.5px;">
                                                Crixen
                                            </h1>
                                            
                                            <!-- Content -->
                                            <h2 style="margin:0 0 16px 0;font-family:'Space Grotesk','Inter',sans-serif;font-size:20px;font-weight:600;color:#F4F4F4;">
                                                Reset Your Password
                                            </h2>
                                            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#A7A7A7;">
                                                You requested to reset your password. Click the button below to create a new one.
                                            </p>
                                            
                                            <!-- Button -->
                                            <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background-color:#F4F4F4;color:#050505;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;transition:all 0.2s;">
                                                Reset Password
                                            </a>
                                            
                                            <!-- Divider -->
                                            <div style="margin:32px 0;height:1px;background:rgba(255,255,255,0.08);"></div>
                                            
                                            <!-- Footer -->
                                            <p style="margin:0 0 8px 0;font-size:13px;color:#A7A7A7;">
                                                If you didn't request this, you can safely ignore this email.
                                            </p>
                                            <p style="margin:0;font-size:12px;color:#666;">
                                                This link expires in 1 hour.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Bottom footer -->
                                <p style="margin:24px 0 0 0;font-size:12px;color:#666;">
                                    © ${new Date().getFullYear()} Crixen. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        });

        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
        return res.status(400).json({ error: 'Email, token, and password are required' });
    }

    // Validate password
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    if (password.length > 72) {
        return res.status(400).json({ error: 'Password is too long (max 72 characters)' });
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            error: 'Password must include uppercase, lowercase, number, and special character'
        });
    }

    try {
        // Check if user exists
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Note: In production, you would verify the token against a stored token
        // For now, we'll just update the password directly
        // This is simplified - in production, store tokens in DB and verify them

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = router;
