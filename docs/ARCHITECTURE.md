# System Architecture & Blueprint

## High-Level Topology

```
                  ┌────────────────────────────────────────┐
                  │          USER CLIENT BROWSER           │
                  │   Next.js 16 (App Router + Turbopack)  │
                  │   Tailwind CSS Minimalist Swiss UI     │
                  └───────────────────┬────────────────────┘
                                      │ HTTP / JSON (Port 3000)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │         BACKEND FASTAPI SERVICE        │
                  │   Python 3.13 + Uvicorn (Port 8000)    │
                  │   Asynchronous Task Orchestrator       │
                  └─────────┬───────────────────┬──────────┘
                            │                   │
         ┌──────────────────┴──┐             ┌──┴──────────────────┐
         ▼                     ▼             ▼                     ▼
┌──────────────────┐  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  AI GATEWAY      │  │ DATABASE       │ │ PUBLIC FEEDS   │ │ NOTION API     │
│  Local Ollama    │  │ SQLite /       │ │ Remotive,      │ │ Mirror &       │
│  (Qwen/Llama)    │  │ PostgreSQL     │ │ Arbeitnow,     │ │ Auto-Created   │
│  or Cloud Fallback│  │ (SQLAlchemy)   │ │ LinkedIn/Indeed│ │ Database       │
└──────────────────┘  └────────────────┘ └────────────────┘ └────────────────┘
```

---

## 1. Core Architectural Pillars

### Principle 01: One Source of Truth (Career DNA)
Your verified professional history lives exclusively inside your **Career DNA Profile**. The system never invents credentials, companies, or metrics. Every bullet point is indexed into an underlying evidence corpus.

### Principle 02: Multi-Agent Parallel Workforce
Rather than running one monolithic prompt, the system deploys **1,000 specialized asynchronous workers** divided into task-oriented pools:
- **300 Crawlers**: Ingest opportunities across LinkedIn, JobStreet, Indeed, and public feeds based on user preferences.
- **300 Tailors**: Use the local LLM to draft tailored APA 7th Edition resumes matching each job description.
- **400 Independent Appliers**: Process form fields, application questions, and stage submissions.

### Principle 03: Anti-Hallucination Verification Gate
Before any generated statement is staged for review, it passes through the verification engine:
$$\text{Claim } C_i \longrightarrow \text{Evidence Match Against Verified Corpus } E \longrightarrow \text{Confidence Score } \ge 0.85$$
If a proposed claim lacks underlying evidence (e.g. an unverified skill or exaggerated metric), it is immediately **BLOCKED**.

### Principle 04: Human Approval Safety Boundary
The workforce operates autonomously up to the point of submission. Every application stops at `READY_FOR_REVIEW`. The candidate retains final human authority to inspect the diff and click `[ APPROVE & SUBMIT ]`.

### Principle 05: Local AI First
The AI Gateway directly interfaces with **Ollama** running locally on `http://localhost:11434`. Model weights remain on your local machine, ensuring complete data privacy and zero API bills.

---

## 2. Deterministic Compatibility Scoring Formula

Candidate matching does not rely solely on vague LLM summaries. It combines a deterministic 6-factor mathematical equation with embedding similarity:

$$\text{Total Match Score} = \sum_{k=1}^{6} w_k \cdot S_k$$

| Factor | Weight ($w_k$) | Computation Method |
|---|---|---|
| **Technical Skills** | 35% | Jaccard & keyword overlap between job requirements and verified skills |
| **Experience Years** | 25% | Candidate verified years vs. minimum required years ($Y_{\text{cand}} / Y_{\text{req}}$ capped at 1.0) |
| **Featured Projects** | 15% | Presence of repositories with matching tech stack tags |
| **Education** | 10% | Degree and technical field alignment |
| **Domain Fit** | 10% | AI / Machine Learning vs. Web / Full Stack domain alignment |
| **Location / Remote** | 5% | Remote compatibility or geographic vicinity |

$$\text{Final Compatibility Score} = 0.85 \cdot \text{Deterministic Score} + 0.15 \cdot (\text{Embedding Cosine Similarity} \times 100)$$

---

## 3. Data Models (Database Schema)

The backend utilizes SQLAlchemy ORM with support for SQLite and PostgreSQL:

### `profiles` Table
- `id` (String, Primary Key, default: `"default"`)
- `name` (String): Candidate full name
- `headline` (String): Professional title
- `email` (String): Contact email
- `location` (String): Geographic location or "Remote"
- `years` (Integer): Verified professional experience
- `education` (String): Academic credential
- `skills` (JSON): Array of verified skill strings
- `experience` (JSON): Array of employment history items
- `projects` (JSON): Array of repositories with tech stack
- `links` (JSON): Dictionary of GitHub, LinkedIn, and Portfolio URLs
- `evidence` (JSON): Array of source-cited evidence snippets

### `jobs` Table
- `id` (String, Primary Key): 12-character deduplication fingerprint
- `title` (String): Job role title
- `company` (String): Organization name
- `location` (String): Location or Remote
- `remote` (Boolean): Remote flag
- `salary` (String): Listed compensation or "Not listed"
- `source` (String): Ingestion portal (LinkedIn, JobStreet, Remotive, etc.)
- `url` (String): Direct posting URL
- `domain` (String): Categorized field (AI, Web, Data)
- `skills` (JSON): Extracted requirement keywords
- `years` (Integer): Minimum required years
- `description` (Text): Cleaned, sanitized job text

### `applications` Table
- `id` (String, Primary Key): Formatted as `a-{job_id}`
- `job_id` (String, Foreign Key)
- `company` (String)
- `role` (String)
- `match` (Integer): Final compatibility percentage
- `status` (String): Pipeline status (`SAVED`, `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `REJECTED`)
- `resume` (Text): Tailored resume content
- `cover` (Text): Customized cover letter
- `answers` (JSON): Auto-filled question responses
- `verified` (Boolean): Evidence verification status
- `events` (JSON): Chronological audit trail with timestamps

---

## 4. End-to-End Execution Flow

```
1. USER INGESTION
   Candidate uploads Resume PDF/DOCX + enters GitHub username + pastes LinkedIn profile.
   │
2. LOCAL LLM EXTRACTION
   Ollama parses text into structured JSON. Heuristics extract evidence corpus into database.
   │
3. APA 7TH CV GENERATOR
   System compiles standardized APA format CV with running heads and code citations.
   │
4. PARALLEL WORKFORCE SPAWN
   User clicks "Deploy 1,000 Workers".
   ├── 300 Discovery Bots crawl LinkedIn, JobStreet, and Indeed.
   ├── Local LLM extracts requirements & computes 6-factor compatibility.
   ├── 300 Tailoring Bots synthesize APA resume diffs with verified evidence.
   └── 400 Independent Application Bots stage applications & autofill forms.
   │
5. HUMAN APPROVAL GATE
   Candidate reviews proposed changes, accepts diffs, and clicks "Approve & Submit".
   │
6. NOTION AUTO-SYNC
   1-Click synchronizer mirrors all applications into a structured Notion database.
```
