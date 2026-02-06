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
router.post('/upload', async (req, res) => {
    const { projectId, strategyData, groupId = 'crixen-strategies' } = req.body;

    if (!strategyData) {
        return res.status(400).json({ error: 'strategyData is required' });
    }

    try {
        const { sdk, nearAccountId } = await getUserNovaSdk(req.user.id);

        // Ensure group exists
        try {
            await sdk.registerGroup(groupId);
        } catch (e) {
            // Ignore "already exists" error
            if (!e.message?.includes('already exists')) {
                console.warn('Group registration warning:', e.message);
            }
        }

        // Prepare file data
        const fileName = projectId ? `strategy-${projectId}.json` : 'strategy.json';
        const fileData = Buffer.from(JSON.stringify(strategyData, null, 2), 'utf-8');

        // Upload to NOVA (encrypts client-side in SDK)
        const result = await sdk.upload(groupId, fileData, fileName);

        console.log(`✅ Uploaded strategy to NOVA: CID=${result.cid}`);

        // Store CID reference in database
        if (projectId) {
            await db.query(`
                INSERT INTO user_strategies (user_id, project_id, ipfs_cid, near_tx_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, project_id) 
                DO UPDATE SET ipfs_cid = $3, near_tx_id = $4, updated_at = NOW()
            `, [req.user.id, projectId, result.cid, result.trans_id]);
        }

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
router.get('/retrieve/:cid', async (req, res) => {
    const { cid } = req.params;
    const { groupId = 'crixen-strategies' } = req.query;

    try {
        const { sdk, nearAccountId } = await getUserNovaSdk(req.user.id);

        // Retrieve from NOVA (decrypts in SDK)
        const { data } = await sdk.retrieve(groupId, cid);

        const strategyJson = Buffer.from(data).toString('utf-8');
        const strategyData = JSON.parse(strategyJson);

        res.json({
            success: true,
            cid,
            data: strategyData,
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
// =============================================================================
router.get('/strategy/:projectId', async (req, res) => {
    const { projectId } = req.params;

    try {
        // Get CID from database
        const result = await db.query(`
            SELECT ipfs_cid, near_tx_id, updated_at
            FROM user_strategies
            WHERE user_id = $1 AND project_id = $2
        `, [req.user.id, projectId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        const { ipfs_cid, near_tx_id, updated_at } = result.rows[0];

        // Retrieve from NOVA
        const { sdk, nearAccountId } = await getUserNovaSdk(req.user.id);
        const { data } = await sdk.retrieve('crixen-strategies', ipfs_cid);

        const strategyJson = Buffer.from(data).toString('utf-8');
        const strategyData = JSON.parse(strategyJson);

        res.json({
            success: true,
            projectId: parseInt(projectId),
            cid: ipfs_cid,
            transactionId: near_tx_id,
            updatedAt: updated_at,
            data: strategyData,
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
