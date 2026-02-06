# Crixen SaaS Platform

**The Ultimate Social Media AI Agent.**

Crixen is a centralized SaaS ecosystem designed to scale with your brand. It consists of a web dashboard for strategy management and a browser extension for on-platform execution.

---

## System Architecture

The project is divided into three interconnected components:

### 1. Crixen API (`/crixen-api`)
**The Central Nervous System.**
*   **Tech**: Node.js, Express, PostgreSQL.
*   **Role**: Handles authentication, database interactions, and acts as the secure proxy for AI and storage operations.
*   **Key Features**:
    *   **Secure AI Proxy**: Routes requests to NEAR AI using system-level API keys.
    *   **Centralized Auth**: JWT-based authentication synced across web and extension.
    *   **NOVA Integration**: Zero-knowledge encrypted storage with invisible NEAR account creation.

### 2. Crixen Dashboard (`/crixen-web`)
**The Command Center.**
*   **Tech**: React, Vite, TailwindCSS, Lucide React.
*   **Role**: A web-based dashboard for users to manage subscriptions, stats, and brand strategies.
*   **Key Features**:
    *   **Strategy Brain**: Create and manage brand voices and strategies per project.
    *   **Usage Tracking**: Visualize API usage and limits.
    *   **Billing**: Manage subscriptions (Starter, Pro, Agency).

### 3. Crixen Extension (`/crixen-extension`)
**The Agent in the Field.**
*   **Tech**: Chrome Extension (Manifest V3), Vanilla JS.
*   **Role**: Overlays AI assistance onto social platforms (Instagram, X/Twitter, Notion).
*   **Key Features**:
    *   **Zero-Config Auth**: Automatically syncs login state from the Dashboard.
    *   **Notion Capture**: Scrape strategies from Notion tables and sync to cloud.
    *   **Local Execution**: Runs fast by caching strategy locally.

---

## Key Features

### Seamless Authentication
No more copying API keys.
1.  Log in to the **Crixen Dashboard**.
2.  Open the **Extension**.
3.  It automatically detects your session and logs you in.

### NOVA Encrypted Storage (Active on Mainnet)
Secure, zero-knowledge storage for sensitive brand strategies.
*   **Architecture**: Strategies & Brand Voices are encrypted client-side (server acts as client) and uploaded to **IPFS** via **NOVA SDK**.
*   **Database Masking**: The SQL database **NEVER** stores plain text strategies. It stores masked placeholders (e.g., `**SECURED ON NOVA**`) while real data lives on IPFS.
*   **Platform-Managed Security**: Uses the platform's NEAR Mainnet account (`ij03l.nova-sdk.near`) to authorize secure uploads, removing the need for users to manage wallets.

### Tiered SaaS Model
| Tier | Projects | Strategies/Project | NOVA Storage |
|------|----------|-------------------|--------------|
| **Starter (Free)** | 1 | 3 | Encrypted |
| **Pro ($10/mo)** | 3 | 10 | Encrypted |
| **Agency ($100/mo)** | Unlimited | Unlimited | Encrypted |

---

## Quick Start Guide

### Prerequisites
*   Node.js (v20+) & pnpm
*   PostgreSQL Database
*   NEAR AI API Key (System Level)
*   NEAR Master Account (for NOVA - optional)

### 1. Start the API
```bash
cd crixen-api
# Configure .env (see .env.example)
pnpm install
pnpm dev
# Runs on http://localhost:3000
```

### 2. Start the Dashboard
```bash
cd crixen-web/app/app
pnpm install
pnpm dev
# Runs on http://localhost:5173
```

### 3. Load the Extension
1.  **Install**:
    *   Open Chrome -> `chrome://extensions`
    *   Enable "Developer Mode"
    *   "Load Unpacked" -> Select `/crixen-extension` folder.
2.  **Sync**:
    *   Log in to the Dashboard (`http://localhost:5173` or `https://crixen.xyz`).
    *   Open the extension popup and click **Sign in via Dashboard**.

---

## Configuration

### API (`crixen-api/.env`)
```ini
PORT=3000
DATABASE_URL=postgres://...
JWT_SECRET=your_secret
NEAR_AI_API_KEY=sk-...

# NOVA Integration (Mainnet)
NEAR_MASTER_ACCOUNT_ID=ij03l.nova-sdk.near
NOVA_API_KEY=nova_sk_...
ENCRYPTION_SECRET=32-byte-hex-secret
NOVA_USE_TESTNET=false
```

### Extension Configuration
The extension is pre-configured to use the Production API (`api.crixen.xyz`).
To change this for local development:
1.  Edit `crixen-extension/src/config.js`.
2.  Update `manifest.json` host permissions.

---

**Version**: 2.1.0
**License**: Proprietary
