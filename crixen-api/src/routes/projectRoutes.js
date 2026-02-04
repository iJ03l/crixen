const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const db = require('../config/db');

router.use(requireAuth);

// GET /api/v1/projects
router.get('/', async (req, res) => {
    const user = req.user;

    // Limits based on tier
    const limits = { starter: 1, pro: 3, agency: Infinity };
    const maxProjects = limits[user.tier] || 1;

    try {
        const result = await db.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
        res.json({
            projects: result.rows,
            limits: { maxProjects }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// POST /api/v1/projects
router.post('/', async (req, res) => {
    const { name } = req.body;
    const user = req.user;

    // Validation
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    try {
        // Check tier limits
        const countRes = await db.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [user.id]);
        const currentCount = parseInt(countRes.rows[0].count);

        const limits = { starter: 1, pro: 3, agency: Infinity };
        const maxProjects = limits[user.tier] || 1;

        if (currentCount >= maxProjects) {
            return res.status(403).json({ error: 'Project limit reached for your tier' });
        }

        // Create Project
        const insertRes = await db.query(
            'INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING *',
            [user.id, name]
        );

        res.json(insertRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT /api/v1/projects/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user;

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    try {
        const result = await db.query(
            'UPDATE projects SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [name, id, user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

module.exports = router;
