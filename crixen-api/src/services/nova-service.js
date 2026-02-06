// =============================================================================
// NOVA Secure File-Sharing Service
// Handles encrypted strategy storage using NOVA SDK (IPFS + NEAR)
// =============================================================================

const { NovaSdk } = require('nova-sdk-js');

class NovaService {
    constructor() {
        this.sdkCache = new Map(); // Cache SDK instances per user
        this.knownGroups = new Set(); // Cache known existing groups
        this.initialized = false;
    }

    /**
     * Check if NOVA is configured and ready
     */
    isReady() {
        return !!process.env.NOVA_API_KEY;
    }

    /**
     * Get or create SDK instance for a user's NEAR account
     */
    async getSdk(nearAccountId) {
        if (!this.isReady()) {
            throw new Error('NOVA_API_KEY not configured');
        }

        if (!this.sdkCache.has(nearAccountId)) {
            const config = {
                apiKey: process.env.NOVA_API_KEY
            };

            // Use testnet for development
            if (process.env.NOVA_USE_TESTNET === 'true') {
                config.rpcUrl = 'https://rpc.testnet.near.org';
                config.contractId = 'nova-sdk-6.testnet';
            }

            const sdk = new NovaSdk(nearAccountId, config);
            this.sdkCache.set(nearAccountId, sdk);
        }

        return this.sdkCache.get(nearAccountId);
    }

    /**
     * Generate NOVA group ID for a project
     */
    getGroupId(projectId) {
        return `crixen-project-${projectId}`;
    }

    /**
     * Ensure NOVA group exists for a project
     */
    async ensureGroup(nearAccountId, projectId) {
        if (!this.isReady()) return false;

        const groupId = this.getGroupId(projectId);

        // If we've already confirmed this group exists in this session, skip
        if (this.knownGroups.has(groupId)) {
            return true;
        }

        try {
            const sdk = await this.getSdk(nearAccountId);

            await sdk.registerGroup(groupId);
            console.log(`✅ NOVA group created: ${groupId}`);
            this.knownGroups.add(groupId);
            return true;
        } catch (error) {
            // Group may already exist, that's fine
            if (error.message && error.message.includes('already exists')) {
                this.knownGroups.add(groupId);
                return true;
            }

            // If it failed due to cost/balance, it might already exist.
            // We'll log a warning but let the caller proceed to try uploading.
            // If upload succeeds, we can assume group exists (managed by upload method or caller).
            console.warn(`NOVA group registration skipped/failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Upload project data (strategies + brand_voice) to NOVA
     * @returns {cid: string, transId: string} or null on failure
     */
    async uploadProjectData(nearAccountId, projectId, data) {
        if (!this.isReady()) {
            console.warn('⚠️ NOVA not configured - data stored locally only');
            return null;
        }

        try {
            const sdk = await this.getSdk(nearAccountId);
            const groupId = this.getGroupId(projectId);

            // Ensure group exists
            await this.ensureGroup(nearAccountId, projectId);

            // Prepare data payload
            const payload = Buffer.from(JSON.stringify(data, null, 2));
            const filename = `project-${projectId}-${Date.now()}.json`;

            // Upload encrypted to NOVA
            const result = await sdk.upload(groupId, payload, filename);

            console.log(`✅ Project data uploaded to NOVA: ${result.cid}`);
            console.log(`🔗 Transaction: ${result.trans_id}`);

            return {
                cid: result.cid,
                transId: result.trans_id
            };
        } catch (error) {
            console.error('NOVA upload failed:', error.message);
            return null;
        }
    }

    /**
     * Retrieve project data from NOVA (decrypted)
     * @returns {Object} { strategies, brand_voice } or null
     */
    async retrieveProjectData(nearAccountId, projectId, cid) {
        if (!this.isReady() || !cid) {
            return null;
        }

        try {
            const sdk = await this.getSdk(nearAccountId);
            const groupId = this.getGroupId(projectId);

            const { data } = await sdk.retrieve(groupId, cid);
            const projectData = JSON.parse(data.toString());

            console.log(`✅ Project data retrieved from NOVA: ${cid}`);
            return projectData;
        } catch (error) {
            console.error('NOVA retrieval failed:', error.message);
            return null;
        }
    }
}

// Singleton instance
const novaService = new NovaService();

module.exports = { novaService, NovaService };
