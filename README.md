# itsLARP / HowToLarped

<div align="center">

```
   _ _        _        _    ____  ____  
  (_) |_ ___ | |      / \  |  _ \|  _ \ 
  | | __/ __|| |     / _ \ | |_) | |_) |
  | | |_\__ \| |___ / ___ \|  _ <|  __/ 
  |_|\__|___/|_____/_/   \_\_| \_\_|    
```

**Your AI Job-Hunting Workforce & Career Operating System**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Local AI](https://img.shields.io/badge/Local_AI-Ollama_Ready-blue.svg?style=flat-square&logo=ollama)](https://ollama.ai)
[![Workforce](https://img.shields.io/badge/Workforce-1%2C000_Parallel_Bots-purple.svg?style=flat-square)](docs/SWARM_WORKFORCE.md)
[![Resume](https://img.shields.io/badge/Resume-APA_7th_Edition-orange.svg?style=flat-square)](docs/APA_RESUME_ENGINE.md)
[![Notion](https://img.shields.io/badge/Notion-1--Click_Sync-black.svg?style=flat-square&logo=notion)](docs/NOTION_INTEGRATION.md)

[Features](#-key-capabilities) • [Architecture](#-system-architecture) • [Quickstart](#-quickstart) • [Bot Swarm](#-the-1000-bot-workforce) • [APA Resume](#-apa-7th-edition-resume-engine) • [Docs Hub](docs/INDEX.md) • [Contributing](CONTRIBUTING.md)

</div>

---

## ⚡ Executive Summary

**itsLARP (HowToLarped)** turns the tedious, repetitive job-hunting cycle into an automated, verifiable operating system. 

Instead of manually copy-pasting job descriptions into chat prompts, guessing resume formats, and managing chaotic spreadsheets:
1. **Upload Career Once**: Feed in your resume (PDF/DOCX/TXT), GitHub profile, and LinkedIn text.
2. **Local LLM Extraction**: Local open-weight models (Ollama Qwen 2.5 / Llama) synthesize your candidate profile and index a verifiable evidence corpus.
3. **APA 7th Edition Output**: Generates academic-grade resumes with running heads and code citations, available for one-click `.txt` and printable PDF download.
4. **Deploy 1,000 Parallel Bots**:
   - **300 Crawlers** browse LinkedIn, JobStreet, Indeed, and Glassdoor matching user preferences with 2FA/login prompt handlers.
   - **300 Tailors** draft job-specific resume diffs using the Local LLM with zero hallucinations.
   - **400 Independent Appliers** autofill application questions and stage submission packages.
5. **1-Click Notion Auto-List**: Self-creates a complete Notion database with columns (*Company Name, Position, Platform, Status, Match Score, Applied Date*) and mirrors applications live.

---

## 🏛 System Architecture

```
                    YOUR CAREER (Resume, GitHub, LinkedIn)
                                      │
                                      ▼
               LOCAL LLM EXTRACTION & APA FORMAT COMPILER
                                      │
                                      ▼
             CAREER DNA PROFILE (Verifiable Source of Truth)
                                      │
                                      ▼
            PARALLEL BOT SWARM (1,000 Concurrent Task Workers)
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
POOL A: 300 CRAWLERS           POOL B: 300 TAILORS           POOL C: 400 APPLIERS
LinkedIn, JobStreet,           Local LLM (Ollama)            Independent Form Autofill
Indeed, Glassdoor              APA 7th Resume Diffs          & Staged Submissions
(w/ 2FA & Login Modals)        Anti-Hallucination Gate       Safety Boundary
       │                              │                              │
       └──────────────────────────────┼──────────────────────────────┘
                                      ▼
             EVIDENCE VERIFICATION (0% Hallucination Gate)
                                      │
                                      ▼
             HUMAN APPROVAL GATE (You Inspect & Approve)
                                      │
                                      ▼
             1-CLICK NOTION MIRROR & POSTGRESQL TRACKER
```

---

## 🚀 Key Capabilities

### 1. Local LLM Candidate Intelligence
- **Multi-Source Ingestion**: Direct upload of PDF, DOCX, TXT, or Markdown resumes with automatic text extraction.
- **GitHub & LinkedIn Sync**: Auto-imports public GitHub repositories, languages, and LinkedIn experience text.
- **Structured Extraction**: The local LLM structures your profile into categorized skills, experience bullet points, featured projects, and verifiable claims.

### 2. APA 7th Edition Resume Engine
- **Standardized Academic & Professional CV**: Compiles your profile according to APA 7th Edition publication standards:
  - Standard Running Head (`RUNNING HEAD: SURNAME / CURRICULUM VITAE`) and page numbers.
  - Centered Title Block and Level 1 Centered Bold headings.
  - Software artifact citations using formal reference notation:
    $$\text{Author, A. A. (Year). } \textit{Project Name} \text{ [Computer software / Tech Stack].}$$
- **One-Click Downloads**: Plaintext (`.txt`) export and print-ready PDF styling (`window.print`).

### 3. The 1,000-Bot Workforce Swarm
- **300 Discovery Bots**: Crawl LinkedIn, JobStreet, Indeed, Glassdoor, Wellfound, and RemoteOK.
- **Platform Account & 2FA Handler**: User can configure accounts; if a bot encounters a 2FA prompt, an interactive verification modal appears to input the OTP.
- **300 Resume Tailoring Bots**: Use the Local LLM to craft tailored resumes aligning your verified skills with job requirements.
- **400 Independent Application Bots**: Autofill application questions and stage submissions.
- **Lightweight Efficiency**: Each bot consumes only **~1.2 MB RAM** ($\approx 1.4\text{ GB}$ total for 1,000 bots), running smoothly on any developer laptop.

### 4. Horizontal Animated Pipeline & Bot Inspector
- **Horizontal Pipeline Map**: Live animated data streams connecting Career DNA $\rightarrow$ 300 Crawlers $\rightarrow$ 300 Tailors $\rightarrow$ 400 Appliers $\rightarrow$ Notion.
- **Interactive Bot Matrix**: Color-coded grid of all 1,000 bots (Crawling, Tailoring, Applying, Needs Verification).
- **Individual Bot Inspector**: Click any bot to inspect its RAM/CPU usage, platform tasks, live logs, and submit 2FA verification.

### 5. 1-Click Notion Integration
- **Zero-Config Database Creation**: Auto-detects your workspace and provisions a dedicated Notion database titled *"HowToLarped Job Applications (1,000 Bots Sync)"*.
- **Structured Columns**: Auto-configures *Company Name*, *Position*, *Platform*, *Applied Date*, *Status*, *Match Score*, and *Resume Format*.
- **Live Mirror**: Automatically mirrors applications from the local database into Notion.

### 6. Anti-Hallucination Gate & Safety Boundary
- **Deterministic 6-Factor Scoring**: Technical Skills (35%), Experience (25%), Projects (15%), Education (10%), Domain (10%), Location (5%).
- **Verification Engine**: Claims without supporting evidence in the Career DNA corpus are blocked.
- **Human Approval**: The workforce halts at `READY_FOR_REVIEW`. No application is ever submitted without explicit human consent.

---

## 🛠 Quickstart

### Prerequisites
- **Node.js** v20+ & **npm** v10+
- **Python** 3.12 or 3.13
- *(Optional, Recommended)* **Ollama** installed on `http://localhost:11434`

### 1. Clone Repository
```bash
git clone https://github.com/darknecrocities/itsLARP.git
cd itsLARP
```

### 2. Start Both Backend & Frontend (Unified Command)
```bash
# Installs web dependencies and launches both FastAPI (Port 8000) & Next.js (Port 3000)
npm run dev
```

- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Setup Local AI (Ollama)
Ensure Ollama is running and pull our primary recommended coding model:
```bash
ollama run qwen2.5-coder:7b
```
The application detects Ollama models automatically.

### 4. Run Test Suite
```bash
# Runs full pytest backend test suite (10 unit tests)
npm test
```

---

## 📁 Monorepo Structure

```
itsLARP/
├── apps/
│   ├── api/                     # FastAPI Python 3.13 backend service
│   │   ├── main.py              # Application entrypoint & REST routing
│   │   ├── services/            # Core business logic & worker engines
│   │   │   ├── apa_resume.py    # APA 7th Edition CV compiler
│   │   │   ├── swarm.py         # 1,000 parallel bots orchestrator
│   │   │   ├── resume_parser.py # Local LLM extraction engine
│   │   │   ├── ai_gateway.py    # Ollama abstraction layer
│   │   │   ├── notion.py        # 1-Click Notion auto-database sync
│   │   │   ├── scoring.py       # Deterministic 6-factor matching
│   │   │   ├── verification.py  # Anti-hallucination verification
│   │   │   └── database.py      # SQLAlchemy SQLite/PostgreSQL models
│   │   └── tests/               # Pytest test suite
│   │
│   └── web/                     # Next.js 16 frontend application
│       ├── app/                 # App Router pages
│       │   ├── page.tsx         # Redesigned Landing Page with live demo
│       │   ├── onboarding/      # Career DNA upload & Local LLM extraction
│       │   ├── resume/          # APA Resume Studio & downloads
│       │   ├── agents/          # 1,000-bot swarm console & 2FA modal
│       │   ├── applications/    # Application tracker pipeline
│       │   ├── jobs/            # Job discovery & custom URL import
│       │   └── integrations/    # 1-Click Notion mirror manager
│       ├── components/          # Reusable UI components
│       │   └── HorizontalPipelineMap.tsx # Animated horizontal diagram & bot matrix
│       └── lib/                 # State management (Zustand) & API clients
│
├── docs/                        # Comprehensive documentation hub
│   ├── INDEX.md                 # Master documentation index
│   ├── ARCHITECTURE.md          # Multi-tier architecture blueprint
│   ├── SWARM_WORKFORCE.md       # 1,000-bot swarm & telemetry guide
│   ├── LOCAL_LLM_INTEGRATION.md # Ollama setup & prompt engineering
│   ├── APA_RESUME_ENGINE.md     # APA 7th Edition formatting standards
│   ├── NOTION_INTEGRATION.md    # 1-Click Notion database sync
│   ├── API_REFERENCE.md         # Full REST API manual
│   └── DEPLOYMENT_GUIDE.md      # Docker & production deployment
│
├── CONTRIBUTING.md              # Contribution guidelines & standards
├── SECURITY.md                  # Security & data privacy policies
├── CHANGELOG.md                 # Release history (v1.0 -> v2.0)
├── CODE_OF_CONDUCT.md           # Community code of conduct
└── LICENSE                      # MIT Open Source License
```

---

## 📚 Documentation Directory

| Document | Focus Area |
|---|---|
| **[docs/INDEX.md](docs/INDEX.md)** | Master Documentation Hub & Roadmap |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Deep-dive system architecture, scoring equations, and database models |
| **[docs/SWARM_WORKFORCE.md](docs/SWARM_WORKFORCE.md)** | 1,000-bot swarm, 300 Crawlers (LinkedIn/JobStreet), 2FA handling, and telemetry |
| **[docs/LOCAL_LLM_INTEGRATION.md](docs/LOCAL_LLM_INTEGRATION.md)** | Ollama local models, prompt engineering, and cloud fallbacks |
| **[docs/APA_RESUME_ENGINE.md](docs/APA_RESUME_ENGINE.md)** | APA 7th Edition CV specifications, software citations, and PDF export |
| **[docs/NOTION_INTEGRATION.md](docs/NOTION_INTEGRATION.md)** | 1-Click Notion database provisioning, schema mapping, and token privacy |
| **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** | Complete REST API endpoints, request payloads, and response schemas |
| **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | Docker Compose, PostgreSQL configuration, and production hosting |

---

## 🔒 Security & Privacy

We treat candidate data with utmost defensiveness:
- **Zero Cloud Leakage**: Local Ollama execution ensures your career history never leaves your device.
- **In-Memory Credentials**: Notion tokens and platform session identifiers are held in browser memory only and never logged.
- **Safety Boundary**: No bot is authorized to apply without explicit human confirmation.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and security policies.

---

## 🤝 Contributing

We welcome pull requests and issues! Please review [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before submitting code.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
