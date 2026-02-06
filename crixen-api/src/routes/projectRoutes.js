const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const db = require('../config/db');
const { novaService } = require('../services/nova-service');

router.use(requireAuth);

// Tier limits configuration
const TIER_LIMITS = {
    starter: { maxProjects: 1, maxStrategiesPerProject: 3 },
    pro: { maxProjects: 3, maxStrategiesPerProject: 10 },
    agency: { maxProjects: Infinity, maxStrategiesPerProject: Infinity }
};

function getTierLimits(tier) {
    // Treat 'free' and 'starter' as the same
    const normalizedTier = (tier === 'free' || tier === 'starter') ? 'starter' : tier;
    return TIER_LIMITS[normalizedTier] || TIER_LIMITS.starter;
}

// GET /api/v1/projects - List all projects with strategy counts
router.get('/', async (req, res) => {
    const user = req.user;
    const limits = getTierLimits(user.tier);

    try {
        const result = await db.query(
            `SELECT id, name, brand_voice, 
                    COALESCE(jsonb_array_length(strategies), 0) as strategy_count,
                    created_at
             FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
            [user.id]
        );
        res.json({
            projects: result.rows,
            limits: {
                maxProjects: limits.maxProjects,
                maxStrategiesPerProject: limits.maxStrategiesPerProject
            },
            tier: user.tier
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Helper to get unified project data (merges DB metadata with NOVA content)
async function getProjectWithUnifiedData(project, user) {
    let strategies = [];
    let brand_voice = '';

    // If we have a NOVA CID, fetch the unified data object
    if (project.nova_cid || project.strategies_cid) {
        try {
            const nearAccountId = user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';

            // Prefer new unified CID, fallback to old strategies_cid
            const cid = project.nova_cid || project.strategies_cid;

            // Try as unified data first
            const novaData = await novaService.retrieveProjectData(nearAccountId, project.id, cid);

            if (novaData) {
                // Check if it's the new unified structure or old strategies array
                if (Array.isArray(novaData)) {
                    // Start of migration: it's just strategies array
                    strategies = novaData;
                    // If DB has brand_voice, use it. If DB is masked, we might lose it in this edge case transition
                    // typically DB brand_voice is authoritative until fully migrated
                    brand_voice = project.brand_voice !== '**SECURED ON NOVA**' ? project.brand_voice : '';
                } else {
                    // Unified object { strategies, brand_voice }
                    strategies = novaData.strategies || [];
                    brand_voice = novaData.brand_voice || '';
                }
            }
        } catch (novaErr) {
            console.warn('Failed to retrieve data from NOVA:', novaErr.message);
            // Fallback to what's in DB if meaningful (not masked)
            if (project.brand_voice !== '**SECURED ON NOVA**') {
                brand_voice = project.brand_voice;
            }
        }
    } else {
        // No NOVA data yet, use DB
        strategies = project.strategies || [];
        brand_voice = project.brand_voice || '';
    }

    return {
        ...project,
        strategies,
        brand_voice,
        // Don't leak implementation details or masked values to frontend
        strategies_cid: undefined,
        nova_cid: undefined
    };
}

// GET /api/v1/projects/:id - Get single project with unified details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const limits = getTierLimits(user.tier);

    try {
        const result = await db.query(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = await getProjectWithUnifiedData(result.rows[0], user);

        res.json({
            ...project,
            limits: {
                maxStrategiesPerProject: limits.maxStrategiesPerProject,
                currentStrategies: project.strategies.length
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST /api/v1/projects - Create new project
router.post('/', async (req, res) => {
    const { name } = req.body;
    const user = req.user;
    const limits = getTierLimits(user.tier);

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    try {
        const countRes = await db.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [user.id]);
        const currentCount = parseInt(countRes.rows[0].count);

        if (currentCount >= limits.maxProjects) {
            return res.status(403).json({
                error: 'Project limit reached for your tier',
                limit: limits.maxProjects,
                current: currentCount
            });
        }

        const insertRes = await db.query(
            'INSERT INTO projects (user_id, name, strategies) VALUES ($1, $2, $3) RETURNING *',
            [user.id, name, '[]']
        );

        res.json(insertRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT /api/v1/projects/:id - Update project (name only)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user;

    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

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

// Helper for unified save
async function saveProjectData(user, projectId, strategies, brandVoice, dbProject = null) {
    const nearAccountId = user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';

    // 1. Upload unified payload to NOVA
    const novaResult = await novaService.uploadProjectData(nearAccountId, projectId, {
        strategies,
        brand_voice: brandVoice
    });

    let novaCid = null;
    if (novaResult) {
        novaCid = novaResult.cid;
    }

    // 2. Update Database (Masked)
    // We store empty placeholders to keep counts working but hide content
    const maskedStrategies = strategies.map(() => ({}));
    const maskedBrandVoice = '**SECURED ON NOVA**';

    const result = await db.query(
        `UPDATE projects 
         SET strategies = $1, brand_voice = $2, nova_cid = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 AND user_id = $5 
         RETURNING *`,
        [JSON.stringify(maskedStrategies), maskedBrandVoice, novaCid, projectId, user.id]
    );

    return result.rows[0];
}

// PUT /api/v1/projects/:id/brand-voice - Update brand voice
router.put('/:id/brand-voice', async (req, res) => {
    const { id } = req.params;
    const { brand_voice } = req.body;
    const user = req.user;

    try {
        // 1. Get current full state (need strategies to re-bundle)
        const projectRes = await db.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, user.id]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

        const fullProject = await getProjectWithUnifiedData(projectRes.rows[0], user);

        // 2. Save with new brand voice, keeping existing strategies
        await saveProjectData(user, id, fullProject.strategies, brand_voice);

        // 3. Return unmasked data to frontend
        res.json({
            ...fullProject,
            brand_voice: brand_voice
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update brand voice' });
    }
});

// PUT /api/v1/projects/:id/strategies - Replace all strategies
router.put('/:id/strategies', async (req, res) => {
    const { id } = req.params;
    const { strategies } = req.body;
    const user = req.user;
    const limits = getTierLimits(user.tier);

    if (!Array.isArray(strategies)) return res.status(400).json({ error: 'Strategies must be an array' });
    if (strategies.length > limits.maxStrategiesPerProject) {
        return res.status(403).json({ error: 'Strategy limit exceeded' });
    }

    try {
        // 1. Get current full state (need brand_voice to re-bundle)
        const projectRes = await db.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, user.id]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

        const fullProject = await getProjectWithUnifiedData(projectRes.rows[0], user);

        // 2. Save with new strategies, keeping existing brand voice
        await saveProjectData(user, id, strategies, fullProject.brand_voice);

        // 3. Return unmasked
        res.json({
            ...fullProject,
            strategies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update strategies' });
    }
});

// POST /api/v1/projects/:id/strategies - Add single strategy
router.post('/:id/strategies', async (req, res) => {
    const { id } = req.params;
    const { name, prompt, source = 'manual' } = req.body;
    const user = req.user;
    const limits = getTierLimits(user.tier);

    if (!name || !prompt) return res.status(400).json({ error: 'Required fields missing' });

    try {
        const projectRes = await db.query('SELECT * FROM projects WHERE id = $1 AND user_id = $2', [id, user.id]);
        if (projectRes.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

        const fullProject = await getProjectWithUnifiedData(projectRes.rows[0], user);

        if (fullProject.strategies.length >= limits.maxStrategiesPerProject) {
            return res.status(403).json({ error: 'Strategy limit reached' });
        }

        const newStrategy = {
            id: Date.now().toString(),
            name, prompt, source,
            created_at: new Date().toISOString()
        };
        const updatedStrategies = [...fullProject.strategies, newStrategy];

        await saveProjectData(user, id, updatedStrategies, fullProject.brand_voice);

        res.json(newStrategy);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add strategy' });
    }
});

// DELETE /api/v1/projects/:id/strategies/:strategyId - Delete single strategy
router.delete('/:id/strategies/:strategyId', async (req, res) => {
    const { id, strategyId } = req.params;
    const user = req.user;

    try {
        const projectRes = await db.query(
            'SELECT strategies FROM projects WHERE id = $1 AND user_id = $2',
            [id, user.id]
        );

        if (projectRes.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const currentStrategies = projectRes.rows[0].strategies || [];
        const updatedStrategies = currentStrategies.filter(s => s.id !== strategyId);

        if (updatedStrategies.length === currentStrategies.length) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        const result = await db.query(
            'UPDATE projects SET strategies = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [JSON.stringify(updatedStrategies), id, user.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete strategy' });
    }
});

module.exports = router;

