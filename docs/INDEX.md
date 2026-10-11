# itsLARP / HowToLarped Documentation Hub

Welcome to the comprehensive technical documentation for **itsLARP / HowToLarped** — the autonomous AI job-hunting workforce and career operating system.

---

## Documentation Directory

```
docs/
├── INDEX.md                   # You are here: Master Documentation Hub
├── ARCHITECTURE.md            # Deep-dive system architecture, data models, and scoring equations
├── SWARM_WORKFORCE.md         # 1,000 parallel bots (300 Crawlers, 300 Tailors, 400 Appliers) & telemetry
├── LOCAL_LLM_INTEGRATION.md   # Ollama local models, AI gateway abstraction, and prompt specifications
├── APA_RESUME_ENGINE.md       # APA 7th Edition CV formatting, running heads, and software citations
├── NOTION_INTEGRATION.md      # 1-Click self-creating Notion database schema and synchronization
├── API_REFERENCE.md           # Comprehensive FastAPI REST endpoints, payloads, and response schemas
└── DEPLOYMENT_GUIDE.md        # Production Docker, PostgreSQL, Nginx, and environment configuration
```

---

## Technical Guides Overview

### 1. [System Architecture](ARCHITECTURE.md)
Explore the multi-tier topology connecting the Next.js React frontend, FastAPI Python asynchronous microservice, SQLite/PostgreSQL persistent database, and the local Ollama AI Gateway. Includes the 6-factor deterministic candidate scoring formula and anti-hallucination verification gate.

### 2. [Parallel Swarm Workforce](SWARM_WORKFORCE.md)
Detailed analysis of the 1,000-bot concurrent workforce:
- **300 Crawling & Browsing Bots**: Scraping LinkedIn, JobStreet, Indeed, Glassdoor, Wellfound, and RemoteOK.
- **Platform Account & 2FA Handler**: Interactive credential management and OTP verification challenge modals.
- **300 Local LLM Tailoring Bots**: Job requirement extraction and evidence-backed document synthesis.
- **400 Independent Application Bots**: Form field population and staged application pipelines.
- **Individual Bot Telemetry**: Lightweight resource footprint (~1.2 MB RAM / bot) and real-time inspector matrix.

### 3. [Local LLM & AI Gateway](LOCAL_LLM_INTEGRATION.md)
How to configure and run local open-weight models (`qwen2.5-coder:7b`, `llama3.2:latest`, `gemma3:4b`) with zero third-party API costs and strict data privacy. Covers structured JSON prompt engineering and graceful cloud fallbacks.

### 4. [APA 7th Edition Resume Engine](APA_RESUME_ENGINE.md)
Specification for generating Academic and Professional CVs according to APA 7th Edition guidelines:
- Running heads and right-aligned page numbering
- Formal centered title blocks and Level 1 centered bold headings
- Software artifact citations using standard reference notation (`Author, Year, Title [Computer software]`)
- One-click `.txt` downloads and printable PDF formatting

### 5. [1-Click Notion Integration](NOTION_INTEGRATION.md)
How the automated Notion integration self-creates a complete database with columns for **Company Name**, **Position**, **Platform**, **Applied Date**, **Status**, **Match Score**, and **Resume Format**, mirroring applications in real time.

### 6. [REST API Reference](API_REFERENCE.md)
Full specification of all backend endpoints under `/profile`, `/jobs`, `/match`, `/applications`, `/swarm`, and `/integrations/notion`.

### 7. [Production Deployment Guide](DEPLOYMENT_GUIDE.md)
Step-by-step instructions for running the application using Docker Compose, configuring production PostgreSQL databases, setting up reverse proxies with SSL, and tuning concurrency limits.

---

## Quick Navigation

| Topic | Link |
|---|---|
| Architecture Blueprint | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| 1,000 Bots Swarm | [docs/SWARM_WORKFORCE.md](SWARM_WORKFORCE.md) |
| Local LLM Setup | [docs/LOCAL_LLM_INTEGRATION.md](LOCAL_LLM_INTEGRATION.md) |
| APA 7th Formatting | [docs/APA_RESUME_ENGINE.md](APA_RESUME_ENGINE.md) |
| Notion Auto-List | [docs/NOTION_INTEGRATION.md](NOTION_INTEGRATION.md) |
| API Reference | [docs/API_REFERENCE.md](API_REFERENCE.md) |
| Production Deployment | [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Contributing Guidelines | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| Security Policy | [../SECURITY.md](../SECURITY.md) |
