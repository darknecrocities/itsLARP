# HowToLarped
**Your AI Job-Hunting Workforce & Career Operating System**

Upload your career once. Deploy specialized AI workers to discover opportunities, understand job requirements, score candidate compatibility, tailor evidence-backed applications, and track your entire search.

---

## Architecture Overview

```
                YOUR CAREER
                     │
                     ▼
             CAREER DNA PROFILE (Source of Truth)
                     │
                     ▼
             AI AGENT WORKFORCE (1,000 Task Workers)
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   DISCOVERY      TAILORING     TRACKING
    AGENTS         AGENTS        AGENTS
       │             │             │
       └─────────────┼─────────────┘
                     ▼
             EVIDENCE VERIFICATION (Anti-Hallucination Gate)
                     │
                     ▼
             HUMAN APPROVAL GATE
                     │
                     ▼
             APPLICATIONS & NOTION SYNC
```

---

## Core Product Modules (100% Dynamic)

| Module | Implementation |
|---|---|
| **01 Authentication** | Google, GitHub (auto-import repos, languages, projects), Email/Password |
| **02 Career DNA** | Structured candidate profile with verifiable evidence corpus and anti-hallucination tracking |
| **03 Resume Studio** | Master Resume + immutable job-specific tailored versions with original vs. proposed diffs |
| **04 Job Discovery** | Live multi-source ingestion (Remotive, Arbeitnow), custom URL scraping, and deduplication |
| **05 Job Intelligence** | Deterministic + embedding scoring: Technical Skills (35%), Experience (25%), Projects (15%), Education (10%), Domain (10%), Location (5%) |
| **06 Agent Workforce** | Concurrent task workers (10 to 1,000 workers) with real-time stage progression & live activity feed |
| **07 Application Studio** | Tailored resume, auto-filled form answers, AI-composed cover letter, and claim verification table |
| **08 Safety Boundary** | Human approval required before recording or submitting applications |
| **09 Application Tracker** | Full status pipeline (Saved, Applied, Screening, Interview, Offer, Rejected) + event audit log |
| **10 Notion Integration** | Mirror applications into user's Notion database via Notion API |
| **11 Local AI First** | AI Gateway abstraction layer with first-class local Ollama (Qwen, Gemma, Llama) & cloud fallbacks |
| **12 Analytics** | Real conversion metrics (Response Rate, Interview Rate, Offer Rate) & AI Career Advisor signals |
| **13 Resume Parser** | Direct PDF / DOCX / TXT / Markdown file upload with automated extraction |
| **14 Design System** | Clean Black / White / Gray minimalist aesthetic, Space Grotesk / Inter / JetBrains Mono typography |

---

## Quickstart

### 1. Start Backend API (FastAPI)
```bash
cd apps/api
source .venv/bin/activate
uvicorn main:app --port 8000 --reload
```

Run tests:
```bash
pytest tests
```

### 2. Start Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 3. (Optional) Run with Local Ollama
Ensure Ollama is running on `http://localhost:11434`:
```bash
ollama run qwen2.5-coder:7b
```
The application detects Ollama models automatically in `/settings`.
