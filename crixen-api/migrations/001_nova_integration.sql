-- =============================================================================
-- NOVA Integration Schema Migration
-- Run this migration to add NEAR wallet and strategy storage tables
-- =============================================================================

-- User Wallets Table (stores encrypted NEAR credentials)
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    near_account_id TEXT NOT NULL UNIQUE,
    near_public_key TEXT NOT NULL,
    near_private_key_encrypted TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_user_wallets_near_account ON user_wallets(near_account_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);

-- User Strategies Table (stores IPFS CID references, NOT actual content)
CREATE TABLE IF NOT EXISTS user_strategies (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    ipfs_cid TEXT NOT NULL,
    near_tx_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- Index for fast strategy lookups
CREATE INDEX IF NOT EXISTS idx_user_strategies_user_project ON user_strategies(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_user_strategies_cid ON user_strategies(ipfs_cid);

-- Optional: Add flag to users table to indicate NOVA migration status
ALTER TABLE users ADD COLUMN IF NOT EXISTS uses_nova BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- NOTES:
-- 1. Existing users will have uses_nova = FALSE (strategies in projects table)
-- 2. New users after migration will have uses_nova = TRUE (strategies in NOVA)
-- 3. Run hybrid mode: check uses_nova flag to determine where to read/write
-- =============================================================================
