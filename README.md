<div align="center">
  <img src="crixen-web/app/app/public/logo.png" alt="Crixen Logo" width="50"/>
  <br/>
  <img src="https://readme-typing-svg.herokuapp.com?font=Space+Grotesk&weight=700&size=40&pause=1000&color=F7F7F7&center=true&vCenter=true&width=500&lines=Crixen+Ai" alt="Crixen Ai" />
  <br/>
  <a href="https://github.com/iJ03l/crixen/stargazers"><img src="https://img.shields.io/github/stars/iJ03l/crixen?style=flat&logo=github&color=black&labelColor=gray" alt="Stars"/></a>
  <a href="https://github.com/iJ03l/crixen/network/members"><img src="https://img.shields.io/github/forks/iJ03l/crixen?style=flat&logo=github&color=black&labelColor=gray" alt="Forks"/></a>
  <a href="https://github.com/iJ03l/crixen/issues"><img src="https://img.shields.io/github/issues/iJ03l/crixen?style=flat&logo=github&color=black&labelColor=gray" alt="Issues"/></a>
  <img src="https://img.shields.io/github/languages/top/iJ03l/crixen?style=flat&color=black&labelColor=gray" alt="Top Language"/>
  <br/>
</div>


**The Ultimate Social Media AI Agent.**

Crixen is the co-founder that never sleeps. It is an intelligent autopilot for your browser, designed to keep your brand alive and growing even when you're deep in development.

Everything is managed from [www.crixen.xyz](https://www.crixen.xyz).

---

## Inspiration (The "Why")

As a solo founder, I faced a dilemma: build the product or build the community. I couldn't do both effectively 24/7. I needed a clone—someone to engage with users, write posts, and execute marketing strategies while I focused on code.

I built Crixen to be that solution. It is designed to engage with users, write posts, and execute marketing strategies while you focus on code.

## What it Does

Crixen doesn't just run blindly; it empowers you with 1-click execution, keeping you in control while automating the heavy lifting.

*   **Smart Engagement**: It drafts context-aware, human-like replies to posts and comments on X (Twitter) and Instagram. You simply review and click to send.
*   **Strategic Planning**: Generates full content calendars and brand strategies on your Notion notes.
*   **Assisted Execution**: It manages your brand's voice and growth, allowing you to approve high-quality interactions in seconds rather than minutes typing.

## How We Built It (Tech Stack)

We leveraged the full NEAR Ecosystem to build a secure, private, and powerful agent:

*   **Near AI**: The "brain" of the agent. It processes context for social platforms and generates high-quality, on-brand content and replies.
*   **Nova-SDK**: The "vault". We use Nova's zero-knowledge encryption to store sensitive brand strategies and user data, ensuring that even we cannot access a user's private strategy.
*   **Hotpay & Pingpay**: The "paywall". We integrated Hotpay and Pingpay to handle seamless crypto subscriptions and payments, allowing users to pay for the service with their preferred tokens and not have to think of LLMS api key and gas fees for NOVA-pinata group fees.

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
    *   **NOVA Integration**: Zero-knowledge encrypted storage with invisible NEAR account interaction.

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
*   **Install**: [Available on Chrome Web Store](https://chromewebstore.google.com/detail/crixen/oapmeeppjjmmchhbbdighfimhkifdmgj)
*   **Role**: Overlays AI assistance onto social platforms.
*   **Key Features**:
    *   **X (Twitter)**: AI-powered Posts, Replies, and Quote tweets directly on the platform.
    *   **Instagram**: Automate campaign engagement and sensitization comments.
    *   **Notion**: Personal Assistant to generate content calendars, brand strategies, and detailed reports.
    *   **Zero-Config Auth**: Automatically syncs login state from the Dashboard.
    *   **Notion Capture**: Scrape strategies from Notion tables and sync to your dashboard.
    *   **Local Execution**: Runs fast by caching strategy locally.

---

## Key Features

### Seamless Authentication
No more copying API keys.
1.  Log in to the **Crixen Dashboard**.
2.  Open the **Extension**.
3.  It automatically detects your session and logs you in.

### Seamless Integration & Payments
We abstract the complexity of Web3 and AI infrastructure:
*   **PingPay & HotPay**: Integrated payment flows that make the platform seamless. Users don't need to manage NEAR AI API keys or handle gas fees for NOVA privacy features manually.
*   **NOVA Encrypted Storage**: Zero-knowledge storage for sensitive strategies, ensuring privacy without technical friction.
*   **No Wallet Management**: The platform handles the underlying NEAR account interaction (`ij03l.nova-sdk.near`) so you can focus on your brand.

### Tiered SaaS Model
| Tier | Projects | Strategies/Project | NOVA Storage |
|------|----------|-------------------|--------------|
| **Starter (Free)** | 1 | 3 | **Encrypted (NOVA)** |
| **Pro ($10/mo)** | 3 | 10 | Encrypted |
| **Agency ($100/mo)** | Unlimited | Unlimited | Encrypted |

---

## Quick Start Guide

### Prerequisites
*   Node.js (v20+) & pnpm
*   PostgreSQL Database
*   NEAR AI API Key (System Level)
*   NEAR Master Account (for NOVA)

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
    *   **Official**: [Install from Chrome Web Store](https://chromewebstore.google.com/detail/crixen/oapmeeppjjmmchhbbdighfimhkifdmgj)
    *   **Dev Mode**: Open Chrome -> `chrome://extensions` -> Enable "Developer Mode" -> "Load Unpacked" -> Select `/crixen-extension` folder.
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

## Contributing
Crixen is now Open Source! We welcome contributions from everyone. Whether it's adding new platform integrations, refining AI models, or improving the dashboard UI, feel free to fork the repo and submit a PR. 

More integrations are coming soon!

---

**Version**: 2.2.0
**License**: MIT (Open Source)
