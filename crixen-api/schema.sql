-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for social login users
    google_id VARCHAR(255) UNIQUE,
    github_id VARCHAR(255) UNIQUE,
    tier VARCHAR(50) DEFAULT 'starter',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    expiry_reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand_voice TEXT DEFAULT '',
    strategies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage Logs Table (for AI quota tracking)
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'generate_text'
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster quota lookups
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_logs (user_id, created_at);

-- Orders Table (for HOT Pay)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    memo VARCHAR(255) UNIQUE NOT NULL,
    amount VARCHAR(50) NOT NULL, -- Storing as string to avoid precision issues with crypto/large numbers if needed, or decimal
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    item_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table (Issued after successful payment)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    ticket_data JSONB, -- Flexible column for ticket details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
