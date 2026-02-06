// =============================================================================
// NEAR Account Factory Service
// Creates invisible NEAR accounts for users during signup
// =============================================================================

const { KeyPair, connect } = require('near-api-js');
const { InMemoryKeyStore } = require('near-api-js/lib/key_stores');
const crypto = require('crypto');

class NearAccountFactory {
    constructor() {
        this.connection = null;
        this.masterAccount = null;
        this.keyStore = new InMemoryKeyStore();
        this.initialized = false;
    }

    /**
     * Initialize connection to NEAR mainnet with master account
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load master account keypair
            const masterPrivateKey = process.env.NEAR_MASTER_PRIVATE_KEY;

            // Check if private key is present and looks valid-ish (e.g. starts with ed25519:)
            if (!masterPrivateKey || !masterPrivateKey.includes(':')) {
                console.warn('⚠️ NEAR_MASTER_PRIVATE_KEY missing or invalid - NEAR subaccount creation disabled (using platform account only)');
                this.initialized = false;
                return;
            }

            const masterKeyPair = KeyPair.fromString(masterPrivateKey);
            const masterAccountId = process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';

            await this.keyStore.setKey('mainnet', masterAccountId, masterKeyPair);

            const connectionConfig = {
                networkId: 'mainnet',
                keyStore: this.keyStore,
                nodeUrl: 'https://rpc.mainnet.near.org',
                walletUrl: 'https://wallet.mainnet.near.org',
                helperUrl: 'https://helper.mainnet.near.org'
            };

            this.connection = await connect(connectionConfig);
            this.masterAccount = await this.connection.account(masterAccountId);
            this.initialized = true;

            console.log(`✅ NEAR Account Factory initialized with ${masterAccountId}`);
        } catch (error) {
            console.error('⚠️ Failed to initialize NEAR Account Factory (running in platform-only mode):', error.message);
            // Do not throw, just leave uninitialized
            this.initialized = false;
        }
    }

    /**
     * Check if factory is ready
     */
    isReady() {
        return this.initialized && this.masterAccount !== null;
    }

    /**
     * Sanitize email to create valid NEAR account name
     * alice@gmail.com → alice-gmail.ij03l.nova-sdk.near
     */
    sanitizeEmail(email) {
        return email
            .toLowerCase()
            .replace(/@/g, '-')
            .replace(/\+/g, '-')
            .replace(/\./g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 40); // NEAR account name max length
    }

    /**
     * Create NEAR account for user (invisible to user)
     * @param {string} email - User's email
     * @param {number} userId - User's database ID
     * @returns {Promise<{accountId: string, publicKey: string, privateKey: string}>}
     */
    async createUserAccount(email, userId) {
        if (!this.isReady()) {
            throw new Error('NEAR Account Factory not initialized');
        }

        const masterAccountId = process.env.NEAR_MASTER_ACCOUNT_ID || 'ij03l.nova-sdk.near';
        const baseAccountName = this.sanitizeEmail(email);
        let accountId = `${baseAccountName}.${masterAccountId}`;

        // Generate new keypair for this user
        const newKeyPair = KeyPair.fromRandom('ed25519');
        const publicKey = newKeyPair.getPublicKey().toString();
        const privateKey = newKeyPair.toString();

        try {
            // Create the account on NEAR (0.1 NEAR initial balance)
            await this.masterAccount.createAccount(
                accountId,
                newKeyPair.getPublicKey(),
                '100000000000000000000000' // 0.1 NEAR in yoctoNEAR
            );

            console.log(`✅ Created NEAR account: ${accountId}`);

            return {
                accountId,
                publicKey,
                privateKey
            };
        } catch (error) {
            // Account already exists - add unique suffix
            if (error.message && error.message.includes('already exists')) {
                console.log(`Account ${accountId} exists, trying with suffix`);

                const uniqueAccountId = `${baseAccountName}-${userId}.${masterAccountId}`;

                await this.masterAccount.createAccount(
                    uniqueAccountId,
                    newKeyPair.getPublicKey(),
                    '100000000000000000000000'
                );

                console.log(`✅ Created NEAR account: ${uniqueAccountId}`);

                return {
                    accountId: uniqueAccountId,
                    publicKey,
                    privateKey
                };
            }

            throw error;
        }
    }

    /**
     * Encrypt private key before storing in database
     * Uses AES-256-GCM with user-specific salt
     */
    encryptPrivateKey(privateKey, userId) {
        const algorithm = 'aes-256-gcm';
        const encryptionSecret = process.env.ENCRYPTION_SECRET;

        if (!encryptionSecret) {
            throw new Error('ENCRYPTION_SECRET not configured');
        }

        const key = crypto.scryptSync(encryptionSecret, `user-${userId}`, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt private key when needed for signing
     */
    decryptPrivateKey(encryptedKey, userId) {
        const [ivHex, authTagHex, encrypted] = encryptedKey.split(':');

        const algorithm = 'aes-256-gcm';
        const encryptionSecret = process.env.ENCRYPTION_SECRET;

        if (!encryptionSecret) {
            throw new Error('ENCRYPTION_SECRET not configured');
        }

        const key = crypto.scryptSync(encryptionSecret, `user-${userId}`, 32);
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Get master account balance (for monitoring)
     */
    async getMasterBalance() {
        if (!this.isReady()) return null;

        try {
            const balance = await this.masterAccount.getAccountBalance();
            const availableNear = parseFloat(balance.available) / 1e24;
            return availableNear;
        } catch (error) {
            console.error('Failed to get master balance:', error);
            return null;
        }
    }
}

// Singleton instance
const nearFactory = new NearAccountFactory();

module.exports = { nearFactory, NearAccountFactory };
