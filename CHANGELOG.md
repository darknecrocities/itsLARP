# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-11

### Added
- **1,000 Parallel Bots Swarm**:
  - **300 Crawlers**: Ingest listings across LinkedIn, JobStreet, Indeed, Glassdoor, Wellfound, and RemoteOK based strictly on user preferences.
  - **Platform Credential & 2FA Handler**: Interactive modal to handle 2FA OTP codes and session login verification for job boards.
  - **300 Local LLM Tailoring Bots**: Customized resume diffs with strict anti-hallucination verification.
  - **400 Independent Application Bots**: Automated question autofill and staged review pipelines.
- **APA 7th Edition Resume Engine**:
  - Compiles Curriculum Vitae / Resumes according to APA 7th Edition standards.
  - Running heads, centered title block, level 1 centered headings, and formal software artifact citations (`Author, Year, Title [Computer software]`).
  - Plaintext (`.txt`) download and printable Letter PDF rendering.
- **Local LLM Candidate Extraction**:
  - Synthesizes candidate attributes from combined Resume (PDF/DOCX/TXT), GitHub repos, and LinkedIn profile text using local Ollama models (`qwen2.5-coder:7b`).
  - Lists down parsed attributes with editable badges before saving into Career DNA.
- **Horizontal Pipeline Map & Bot Matrix**:
  - Interactive 5-node horizontal diagram with real-time particle animation and data flow.
  - Color-coded bot matrix (Crawling, Tailoring, Applying, 2FA Challenge).
  - Individual Bot Inspector drawer displaying real-time RAM (~1.2 MB), CPU, active task, and streaming logs.
- **1-Click Notion Integration**:
  - Auto-creates database titled *"HowToLarped Job Applications (1,000 Bots Sync)"* with structured properties for Company Name, Position, Platform, Status, Match Score, Resume Format, Applied Date, and Notes.
  - Automatically mirrors tracked applications into Notion pages.
- **Redesigned Landing Page**:
  - Real interactive demo of the 1,000-bot swarm, horizontal animated pipeline, APA resume preview, and Notion mirror.
- **Comprehensive Documentation Suite**:
  - Added dedicated documentation in `docs/` covering architecture, swarm workforce, local LLM integration, APA format, Notion mirror, REST API reference, and deployment.

---

## [1.0.0] - 2026-10-10

### Added
- **Career DNA Source of Truth**: Structured profile with verifiable evidence corpus.
- **Resume Studio**: Master resume with job-specific diffing.
- **Job Discovery Engine**: Real multi-source ingestion (Remotive, Arbeitnow) and custom URL scraper.
- **Deterministic Match Scoring**: 6-factor mathematical equation (Skills 35%, Experience 25%, Projects 15%, Education 10%, Domain 10%, Location 5%).
- **Application Studio**: Claim verification checklist and human approval safety gate.
- **AI Gateway**: Local Ollama abstraction with cloud fallbacks.
- **Minimalist Swiss UI**: Black/White/Gray palette with Space Grotesk / Inter typography.

---

## [0.1.0] - 2026-10-08

### Added
- Initial project scaffolding and license.
