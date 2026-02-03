const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { token } = req.body; // Token from frontend (Identity Token)

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email } = payload;

        // Check if user exists
        let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (result.rows.length === 0) {
            // Create new user linked to Google
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

module.exports = router;
