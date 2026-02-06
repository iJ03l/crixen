const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const db = require('../config/db');

router.use(requireAuth);

// POST /api/v1/ai/generate
router.post('/generate', async (req, res) => {
    const { projectId, prompt, context } = req.body;
    const user = req.user;

    // 1. Quota Check from DB
    // Get usage for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const usageRes = await db.query(
            'SELECT COUNT(*) FROM usage_logs WHERE user_id = $1 AND created_at >= $2',
            [user.id, startOfDay]
        );
        const currentUsage = parseInt(usageRes.rows[0].count);

        const LIMITS = { starter: 10, pro: 150, agency: Infinity };
        const limit = LIMITS[user.tier] || 10;

        if (currentUsage >= limit) {
            return res.status(403).json({ error: 'Daily limit reached. Upgrade on dashboard to continue.' });
        }

        // 2. Call NEAR AI
        const response = await fetch('https://cloud-api.near.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NEAR_AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-V3.1',
                messages: [
                    { role: 'system', content: 'You are Crixen AI.' },
                    { role: 'user', content: `Context: ${context}\n\nPrompt: ${prompt}` }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`NEAR AI Error: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const tokensUsed = data.usage?.total_tokens || 0;

        // 3. Log Usage to DB
        // Sanitize projectId (must be integer or null)
        let safeProjectId = parseInt(projectId);
        if (isNaN(safeProjectId)) safeProjectId = null;

        await db.query(
            'INSERT INTO usage_logs (user_id, project_id, action_type, tokens_used) VALUES ($1, $2, $3, $4)',
            [user.id, safeProjectId, 'generate_text', tokensUsed]
        );

        res.json({ content, meta: { usage: data.usage } });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'AI Generation Failed' });
    }
});

// GET /api/v1/ai/stats
router.get('/stats', async (req, res) => {
    const user = req.user;
    const limits = { starter: 10, pro: 150, agency: 999999 };

    // Normalize tier: free -> starter
    const tier = (user.tier === 'free' || user.tier === 'starter') ? 'starter' : (user.tier || 'starter');

    const limit = limits[tier] || 10;
    const projectLimit = tier === 'starter' ? 1 : (tier === 'pro' ? 3 : Infinity);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        const usageRes = await db.query(
            'SELECT COUNT(*) FROM usage_logs WHERE user_id = $1 AND created_at >= $2',
            [user.id, startOfDay]
        );
        const generatedCount = parseInt(usageRes.rows[0].count);

        const projectRes = await db.query(
            'SELECT COUNT(*) FROM projects WHERE user_id = $1',
            [user.id]
        );
        const projectCount = parseInt(projectRes.rows[0].count);

        const latestProjectRes = await db.query(
            'SELECT name FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
        );
        const latestProjectName = latestProjectRes.rows[0]?.name || null;

        res.json({
            generatedCount,
            limit,
            projects: projectCount,
            projectLimit,
            latestProjectName
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/v1/ai/activity
router.get('/activity', (req, res) => {
    // Mock Data for recent activity - Keep mock for now or implement logged activity table if needed
    // Assuming usage_logs doesn't store full content for privacy/size reasons in this MVP
    res.json([
        {
            platform: 'Local',
            user: 'You',
            comment: 'Generated content',
            reply: 'AI Response',
            status: 'completed',
            date: new Date().toISOString()
        }
    ]);
});

module.exports = router;
