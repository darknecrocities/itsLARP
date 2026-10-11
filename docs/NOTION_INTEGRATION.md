# 1-Click Notion Integration & Mirror

## Overview

**itsLARP / HowToLarped** provides a **1-click self-creating Notion database** feature. Candidates can mirror all active job searches, tracked applications, match scores, and tailored resumes directly into their personal Notion workspace without manual schema setup.

---

## 1. Automated Database Schema

When triggered, the system invokes the official Notion API (`POST /v1/databases`) to auto-create a database titled:
**`HowToLarped Job Applications (1,000 Bots Sync)`**

The generated database includes the following structured properties:

| Property Name | Notion Type | Description / Options |
|---|---|---|
| **Company Name** | `title` | Primary title identifier (e.g., *Anthropic Labs*) |
| **Position** | `rich_text` | Target role title (e.g., *Staff AI Engineer*) |
| **Platform** | `select` | Source board: `LinkedIn` (Blue), `JobStreet` (Purple), `Indeed` (Green), `Glassdoor` (Yellow), `Direct / Website` (Gray) |
| **Status** | `select` | Pipeline status: `SAVED`, `ANALYZING`, `READY`, `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `REJECTED` |
| **Match Score** | `number` (Percent) | 6-factor deterministic compatibility percentage ($0\%$ to $100\%$) |
| **Resume Format** | `rich_text` | Format used (e.g., *APA 7th Edition - Verified*) |
| **Applied Date** | `date` | Date the application was approved and submitted |
| **URL** | `url` | Direct link to job posting or internal studio package |
| **Notes** | `rich_text` | Verified evidence excerpts and event audit notes |

---

## 2. 1-Click Auto-Creation Mechanism

Users do not need to configure complex database IDs manually:
1. Candidate pastes their **Notion Internal Integration Token** (`ntn_...` or `secret_...`).
2. The backend automatically queries `POST /v1/search` with `{"filter": {"value": "page", "property": "object"}}` to find the first shared workspace page.
3. It constructs the schema, provisions the database, and syncs all current applications into rows.
4. Returns the direct URL to open the new database in Notion!

---

## 3. Step-by-Step Setup Guide

### Step 1: Create an Internal Integration in Notion
1. Go to [notion.so/profile/integrations](https://www.notion.so/profile/integrations).
2. Click **"+ New integration"**.
3. Name it **"HowToLarped"**, select your workspace, and save.
4. Copy the **Internal Integration Secret** (`secret_...` or `ntn_...`).

### Step 2: Share a Page in Notion
1. In your Notion workspace, open or create any blank page (e.g., *"Career"*).
2. Click the top-right `•••` menu $\rightarrow$ **"Connections"** $\rightarrow$ **"Connect to"** $\rightarrow$ select **HowToLarped**.

### Step 3: 1-Click Connect & Sync
1. Open [Integrations (`/integrations`)](file:///Users/arronkianparejas/itsLarper/apps/web/app/integrations/page.tsx) or [Agent Workforce (`/agents`)](file:///Users/arronkianparejas/itsLarper/apps/web/app/agents/page.tsx).
2. Paste your token and click **`[ ⚡ 1-Click: Self-Create List & Sync All ]`**.
3. The database is instantly provisioned and all applications appear in Notion!

---

## 4. Token Privacy & Security

- **In-Memory Browser Storage**: Tokens are maintained strictly in memory during your active session.
- **Never Logged**: The backend never writes integration tokens to logs or telemetry streams.
- **PostgreSQL Source of Truth**: The local database remains the canonical source of truth; Notion operates purely as a read-synchronized mirror.
