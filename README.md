# Crixen SaaS Platform 🚀

**The Ultimate Social Media AI Agent, Reborn as a Platform.**

Crixen has evolved from a standalone browser extension into a robust, centralized SaaS ecosystem designed to scale with your brand. This repository contains the complete source code for the v2.0 overhaul.

---

## 🏗 System Architecture

The project is divided into three distinct, interconnected components:

### 1. 🧠 Crixen API (`/crixen-api`)
**The Central Nervous System.**
*   **Tech**: Node.js, Express, PostgreSQL.
*   **Role**: Handles all business logic, authentication, database interactions, and acts as the secure proxy for AI operations.
*   **Key Features**:
    *   **Centralized Auth**: JWT-based authentication replacing local keys.
    *   **AI Proxy**: securely routes requests to NEAR AI using system-level API keys (no more user-managed keys).
    *   **Project Management**: Manages multi-project configurations (e.g., different brands/strategies).

### 2. 🎛 Crixen Admin (`/crixen-admin`)
**The Command Center.**
*   **Tech**: Next.js 16 (App Router), TailwindCSS, Lucide React.
*   **Role**: A web-based dashboard for users to manage their subscription, view usage stats, and configure brand strategies.
*   **Key Features**:
    *   **Usage Tracking**: Visualize API usage and limits.
    *   **Billing**: Manage tiered subscriptions (Starter, Pro, Agency) via Stripe (In Progress).
    *   **Project Config**: Create and edit brand "Brains" (Strategy Docs).

### 3. 🧩 Crixen Extension (`/crixen-extension`)
**The Agent in the Field.**
*   **Tech**: Chrome Extension (Manifest V3), Vanilla JS.
*   **Role**: The "Thin Client" interface that overlays onto social platforms (Instagram, X/Twitter, Notion).
*   **Refactor Highlights**:
    *   **Zero-Config**: Uses `.env` injected configuration; no longer requires users to paste API keys.
    *   **Secure**: All AI generation requests are signed with the user's JWT and sent to `crixen-api`, not directly to LLMs.
    *   **Memory-Aware**: Pulls context from the centralized User Strategy stored in the backend.

---

## 🌟 Key Features of the Overhaul

### 🔐 Centralized Security
User API keys have been removed from the client side. The system now uses a **System-Level API Key** stored securely in the `crixen-api` backend. Users authenticate via email/password to obtain a session token.

### 🧠 Local-First Memory Architecture
To ensure maximum speed and privacy, strategy data remains stored in **Chrome Local Storage**.
*   **Capture**: Scrape Notion pages to define brand voice locally.
*   **Speed**: No network latency during comment generation setup; the extension reads directly from local memory.
*   **Execution**: The extension constructs the prompt locally (combining strategy + post context) and securely sends it to the API for generation.

### 💎 Tiered SaaS Model
*   **Starter (Free)**: 1 Project/Memory Context. Ideal for solopreneurs managing one brand.
*   **Pro ($20/mo)**: 3 Projects. 1500 Gens/day. Great for creators with multiple personas.
*   **Agency ($200/mo)**: Unlimited Projects & Gens. For social media managers handling many clients. Each project has isolated memory.

---

## 🚀 Quick Start Guide

### Prerequisites
*   Node.js & pnpm
*   PostgreSQL Database
*   NEAR AI API Key (System Level)

### 1. Start the API
```bash
cd crixen-api
# Configure .env (see .env.example)
pnpm install
pnpm dev
# Runs on http://localhost:3000
```

### 2. Start the Admin Dashboard
```bash
cd crixen-admin
pnpm install
pnpm dev
# Runs on http://localhost:3001 (or 3000 if API is on different port)
```

### 3. Load the Extension
1.  **Configure**:
    ```bash
    cd crixen-extension
    # Edit .env with your local API URL
    ./update_config.sh
    ```
2.  **Build**:
    ```bash
    ./build.sh
    ```
3.  **Install**:
    *   Open Chrome -> `chrome://extensions`
    *   Enable "Developer Mode"
    *   "Load Unpacked" -> Select `/crixen-extension` folder.

---

## 📜 Configuration

### API (`crixen-api/.env`)
```ini
PORT=3000
DATABASE_URL=postgres://...
JWT_SECRET=your_secret
NEAR_AI_API_KEY=sk-...
```

### Extension (`crixen-extension/.env`)
```ini
CRIXEN_API_URL=http://localhost:3000/api/v1/ai/generate
NEAR_AI_ENDPOINT=https://cloud-api.near.ai/v1/chat/completions
```
*Run `./update_config.sh` after changing extension vars.*

---

**Version**: 2.0.0 (SaaS Beta)
**License**: Proprietary
