// =============================================================================
// NOVA Routes - Signing proxy for encrypted storage
// Backend signs NOVA transactions on behalf of users
// =============================================================================

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const db = require('../config/db');
const { nearFactory } = require('../services/near-account-factory');

// NOVA SDK will be loaded dynamically
let NovaSdk = null;

/**
 * Initialize NOVA SDK (lazy load)
 */
async function getNovaSDK() {
    if (!NovaSdk) {
        try {
            const novaSdkModule = await import('nova-sdk-js');
            NovaSdk = novaSdkModule.NovaSdk || novaSdkModule.default;
        } catch (error) {
            console.error('Failed to load NOVA SDK:', error);
            throw new Error('NOVA SDK not available');
        }
    }
    return NovaSdk;
}

/**
 * Get user's NOVA SDK instance with their credentials
 */
async function getUserNovaSdk(userId) {
    // Get user's wallet from DB
    const walletResult = await db.query(`
        SELECT near_account_id, near_private_key_encrypted
        FROM user_wallets
        WHERE user_id = $1
    `, [userId]);

    if (walletResult.rows.length === 0) {
        throw new Error('User has no NEAR wallet');
    }

    const { near_account_id, near_private_key_encrypted } = walletResult.rows[0];

    // Decrypt private key
    const privateKey = nearFactory.decryptPrivateKey(near_private_key_encrypted, userId);

    // Create NOVA SDK instance
    const NovaClass = await getNovaSDK();
    const sdk = new NovaClass(near_account_id, {
        apiKey: process.env.NOVA_API_KEY,
        privateKey: privateKey,
        rpcUrl: 'https://rpc.mainnet.near.org',
        contractId: 'nova-sdk.near'
    });

    return { sdk, nearAccountId: near_account_id };
}

// All routes require authentication
router.use(requireAuth);

// =============================================================================
// GET /api/v1/nova/credentials
// Returns user's NEAR account info (no private key!)
// =============================================================================
router.get('/credentials', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT near_account_id, created_at
            FROM user_wallets
            WHERE user_id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'NEAR wallet not found' });
        }

        res.json({
            nearAccount: result.rows[0].near_account_id,
            createdAt: result.rows[0].created_at,
            novaEnabled: true
        });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({ error: 'Failed to get credentials' });
    }
});

// =============================================================================
// POST /api/v1/nova/groups/register
// Register a new NOVA group for the user
// =============================================================================
router.post('/groups/register', async (req, res) => {
    const { groupId } = req.body;

    if (!groupId) {
        return res.status(400).json({ error: 'groupId is required' });
    }

    try {
        const { sdk, nearAccountId } = await getUserNovaSdk(req.user.id);

        await sdk.registerGroup(groupId);

        console.log(`✅ Registered NOVA group '${groupId}' for ${nearAccountId}`);

        res.json({
            success: true,
            groupId,
            owner: nearAccountId
        });
    } catch (error) {
        console.error('Register group error:', error);

        // Handle "already exists" gracefully
        if (error.message && error.message.includes('already exists')) {
            return res.json({ success: true, groupId, alreadyExists: true });
        }

        res.status(500).json({ error: 'Failed to register group' });
    }
});

// =============================================================================
// POST /api/v1/nova/upload
// Upload encrypted strategy to NOVA (backend signs on behalf of user)
// =============================================================================
// =============================================================================
// POST /api/v1/nova/upload
// Upload encrypted strategy to NOVA (backend signs on behalf of user)
// Refactored to match Brand Voice storage (No wallet required)
// =============================================================================
router.post('/upload', async (req, res) => {
    const { projectId, strategyData } = req.body;

    if (!strategyData) {
        return res.status(400).json({ error: 'strategyData is required' });
    }

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required for secure storage' });
    }

    try {
        const { novaService } = require('../services/nova-service');

        // 1. Fetch current project to get brand_voice (we need to preserve it)
        const projectRes = await db.query(
            'SELECT brand_voice FROM projects WHERE id = $1 AND user_id = $2',
            [projectId, req.user.id]
        );

        if (projectRes.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Handle potentially masked brand_voice
        let brandVoice = projectRes.rows[0].brand_voice || '';
        if (brandVoice === '**SECURED ON NOVA**') {
            // If it's masked, we need to fetch the real one from Nova first? 
            // OR we can just fetch the Unified Data.
            // But wait, if we are overwriting strategies, we are creating a NEW unified object.
            // If we don't have the real brand voice, we will lose it.
            // We MUST retrieve the current full object first.
            const { getProjectWithUnifiedData } = require('./projectRoutes'); // We might need to extract this helper or duplicate logic
            // Actually, let's use the novaService to retrieve it if we have a CID
            const currentProjectRes = await db.query(
                'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
                [projectId, req.user.id]
            );
            const currentProject = currentProjectRes.rows[0];

            if (currentProject.nova_cid || currentProject.strategies_cid) {
                const nearAccountId = req.user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';
                const cid = currentProject.nova_cid || currentProject.strategies_cid;
                try {
                    const oldData = await novaService.retrieveProjectData(nearAccountId, projectId, cid);
                    if (oldData) {
                        brandVoice = oldData.brand_voice || '';
                    }
                } catch (e) {
                    console.warn('Could not retrieve old brand voice, it might be lost:', e);
                }
            }
        }

        // 2. Prepare Unified Payload
        const nearAccountId = req.user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';
        const unifiedData = {
            strategies: strategyData,
            brand_voice: brandVoice
        };

        // 3. Upload using NovaService (Master Account fallback)
        const result = await novaService.uploadProjectData(nearAccountId, projectId, unifiedData);

        if (!result || !result.cid) {
            throw new Error('Upload to NOVA failed');
        }

        console.log(`✅ Uploaded unified data to NOVA: CID=${result.cid}`);

        // 4. Update Database (Projects Table)
        // Mask strategies and brand voice
        const maskedStrategies = strategyData.map(s => ({
            id: s.id || Date.now().toString(), // Ensure ID
            name: s.name,
            source: s.source
        }));

        // We update the main project record, mirroring projectRoutes.js
        await db.query(`
            UPDATE projects 
            SET strategies = $1, 
                brand_voice = $2, 
                nova_cid = $3, 
                strategies_cid = $3, 
                updated_at = NOW()
            WHERE id = $4 AND user_id = $5
        `, [
            JSON.stringify(maskedStrategies),
            '**SECURED ON NOVA**',
            result.cid,
            projectId,
            req.user.id
        ]);

        // 5. Update legacy user_strategies table for backward compatibility/reference?
        // The previous implementation used this table. We should probably keep it updated 
        // OR decide if we are fully migrating to 'projects' table columns.
        // The 'getProjectWithUnifiedData' in projectRoutes checks 'nova_cid' on the project table.
        // So updating the 'projects' table is the critical part for the dashboard.
        // We can update user_strategies just in case.
        await db.query(`
            INSERT INTO user_strategies (user_id, project_id, ipfs_cid, near_tx_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, project_id) 
            DO UPDATE SET ipfs_cid = $3, near_tx_id = $4, updated_at = NOW()
        `, [req.user.id, projectId, result.cid, result.trans_id]);

        res.json({
            success: true,
            cid: result.cid,
            transactionId: result.trans_id,
            nearAccount: nearAccountId
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload to NOVA' });
    }
});

// =============================================================================
// GET /api/v1/nova/retrieve/:cid
// Retrieve and decrypt strategy from NOVA
// =============================================================================
// =============================================================================
// GET /api/v1/nova/retrieve/:cid
// Retrieve and decrypt strategy from NOVA
// Refactored to use novaService (No wallet required)
// =============================================================================
router.get('/retrieve/:cid', async (req, res) => {
    const { cid } = req.params;
    const { projectId } = req.query; // Ideally we pass projectId to derive group/context

    try {
        const { novaService } = require('../services/nova-service');
        const nearAccountId = req.user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';

        // Retrieve from NOVA using service
        // We might not know the project ID here if only CID is passed. 
        // novaService.retrieveProjectData requires projectId to derive group.
        // If we don't have projectId, we might default to 'crixen-global-store' or similar if that's what getGroupId returns.
        // strategies were uploaded with projectId.

        let data = null;
        if (projectId) {
            data = await novaService.retrieveProjectData(nearAccountId, projectId, cid);
        } else {
            // Fallback: try to retrieve using the default group logic if projectId isn't provided
            // This might be brittle if group depends strictly on projectId.
            // But getGroupId in nova-service returns hardcoded 'crixen-global-store' currently.
            data = await novaService.retrieveProjectData(nearAccountId, 'default', cid);
        }

        if (!data) {
            return res.status(404).json({ error: 'Data not found or could not be decrypted' });
        }

        res.json({
            success: true,
            cid,
            data: data, // This could be the unified object {strategies, brand_voice}
            nearAccount: nearAccountId
        });
    } catch (error) {
        console.error('Retrieve error:', error);
        res.status(500).json({ error: 'Failed to retrieve from NOVA' });
    }
});

// =============================================================================
// GET /api/v1/nova/strategy/:projectId
// Get strategy for a project (fetches CID from DB, then retrieves from NOVA)
// Refactored to use novaService (No wallet required)
// =============================================================================
router.get('/strategy/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        const { novaService } = require('../services/nova-service');

        // Get CID from projects table (Unified source of truth now)
        const projectRes = await db.query(
            'SELECT nova_cid, strategies_cid FROM projects WHERE id = $1 AND user_id = $2',
            [projectId, req.user.id]
        );

        if (projectRes.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projectRes.rows[0];
        const cid = project.nova_cid || project.strategies_cid;

        if (!cid) {
            return res.status(404).json({ error: 'No secured strategies found for this project' });
        }

        const nearAccountId = req.user.near_account_id || process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';

        // Retrieve unified data
        const unifiedData = await novaService.retrieveProjectData(nearAccountId, projectId, cid);

        if (!unifiedData) {
            return res.status(500).json({ error: 'Failed to decrypt data from NOVA' });
        }

        // Extract strategies from unified payload
        let strategies = [];
        if (Array.isArray(unifiedData)) {
            strategies = unifiedData; // Migration support
        } else {
            strategies = unifiedData.strategies || [];
        }

        res.json({
            success: true,
            projectId: parseInt(projectId),
            cid: cid,
            data: strategies, // Frontend expects array of strategies
            nearAccount: nearAccountId
        });
    } catch (error) {
        console.error('Get strategy error:', error);
        res.status(500).json({ error: 'Failed to get strategy' });
    }
});

// =============================================================================
// GET /api/v1/nova/status
// Check NOVA integration status
// =============================================================================
router.get('/status', async (req, res) => {
    try {
        const walletResult = await db.query(`
            SELECT near_account_id
            FROM user_wallets
            WHERE user_id = $1
        `, [req.user.id]);

        const hasWallet = walletResult.rows.length > 0;

        const strategyCount = await db.query(`
            SELECT COUNT(*) as count
            FROM user_strategies
            WHERE user_id = $1
        `, [req.user.id]);

        res.json({
            novaEnabled: hasWallet,
            nearAccount: hasWallet ? walletResult.rows[0].near_account_id : null,
            storedStrategies: parseInt(strategyCount.rows[0].count)
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

module.exports = router;
