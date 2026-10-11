# REST API Reference Manual

The **itsLARP / HowToLarped** backend runs on **FastAPI** (Python 3.13) on port 8000 by default. Interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.

---

## 1. System & Health Endpoints

### `GET /`
Returns service metadata or browser landing page.
- **Response**: `{"service": "HowToLarped API", "status": "online", "docs": "/docs"}`

### `GET /health`
Liveness probe.
- **Response**: `{"ok": true, "time": "2026-10-11T14:00:00Z"}`

---

## 2. AI Gateway Endpoints

### `GET /ai/status`
Checks local Ollama status, available models, and configured cloud providers.
- **Response**:
```json
{
  "provider": "ollama",
  "model": "qwen2.5-coder:7b",
  "connected": true,
  "models": ["qwen2.5-coder:7b", "llama3.2:latest"]
}
```

### `POST /ai/configure`
Switches active AI provider or model.
- **Request**:
```json
{
  "provider": "ollama",
  "model": "qwen2.5-coder:7b",
  "api_key": null
}
```

---

## 3. Career DNA & Resume Endpoints

### `POST /profile/parse-resume`
Extracts raw text and parsed fields from an uploaded PDF or text resume.
- **Content-Type**: `multipart/form-data`
- **Body**: `file: UploadFile`

### `POST /profile/extract-candidate-llm`
Synthesizes candidate information using the Local LLM (Ollama) from combined resume, GitHub, and LinkedIn inputs.
- **Request**:
```json
{
  "resume_text": "Experienced software engineer...",
  "github_info": "Repositories: itsLARP, rag-agent...",
  "linkedin_text": "Senior Engineer at Tech Corp..."
}
```
- **Response**: Extracted candidate JSON with name, skills, experience, projects, and target roles.

### `POST /profile/apa-resume`
Compiles Career DNA into APA 7th Edition formatted CV.
- **Request**: `{"profile": { ... }}`
- **Response**: `{"text": "...", "html": "...", "format": "APA 7th Edition"}`

### `GET /profile/apa-resume/download`
Downloads the candidate's APA resume as plaintext or printable HTML.
- **Query Params**: `format=txt` or `format=html`

### `POST /profile/save`
Persists candidate profile and evidence corpus into database.
- **Request**: `{"profile": { ... }}`

### `GET /profile`
Retrieves stored candidate profile.

---

## 4. Job Discovery & Intelligence

### `POST /jobs/search`
Queries public job boards (Remotive, Arbeitnow) and baseline pools with candidate scoring.
- **Request**:
```json
{
  "query": "AI Engineer",
  "remote": true,
  "profile": { "skills": ["python", "pytorch"] }
}
```

### `POST /jobs/import-url`
Imports and extracts requirements from an arbitrary career URL (Greenhouse, Lever, LinkedIn, etc.) or pasted text.
- **Request**:
```json
{
  "url": "https://careers.example.com/ai-engineer",
  "title": "AI Engineer",
  "company": "Example Corp",
  "description": ""
}
```

### `GET /jobs/{job_id}`
Retrieves job description and requirements.

---

## 5. Applications & Human Approval

### `POST /applications/prepare`
Prepares a tailored application package: tailored resume, cover letter, autofilled answers, and claim verification.
- **Request**: `{"profile": { ... }, "job_id": "job_12345"}`

### `POST /applications/approve`
Approves and records an application package.
- **Request**:
```json
{
  "job_id": "job_12345",
  "company": "Acme Inc",
  "role": "AI Lead",
  "match": 92,
  "resume": "...",
  "cover": "...",
  "answers": {}
}
```

### `GET /applications`
Lists all tracked applications.

### `PATCH /applications/{app_id}`
Updates application status (`SAVED`, `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `REJECTED`).

---

## 6. Swarm Workforce Endpoints

### `POST /swarm/start`
Deploys up to 1,000 parallel workers across 300 Crawlers, 300 Tailors, and 400 Appliers.
- **Request**:
```json
{
  "profile": { ... },
  "queries": ["Senior AI Engineer"],
  "workers": 1000
}
```

### `GET /swarm/{run_id}`
Returns active swarm snapshot, worker counts, live activity logs, and queue progress.

### `POST /swarm/{run_id}/stop`
Terminates running swarm workers.

### `GET /swarm/{run_id}/bots`
Returns full array of individual bot telemetry items for horizontal diagram and matrix visualization.

### `GET /swarm/{run_id}/bots/{bot_id}`
Inspects a single bot's CPU, RAM, current platform task, and logs.

### `POST /swarm/{run_id}/bots/{bot_id}/verify`
Submits 2FA OTP code or confirms session login to unblock a crawler bot.
- **Request**: `{"code": "123456"}`

---

## 7. Notion Mirror Endpoints

### `POST /integrations/notion/auto-create-and-sync`
1-Click endpoint: automatically creates the Notion database schema and mirrors all applications into rows.
- **Request**:
```json
{
  "token": "secret_abc123...",
  "parent_page_id": null,
  "applications": [ ... ]
}
```
- **Response**:
```json
{
  "ok": true,
  "database_id": "db_xyz789",
  "database_url": "https://notion.so/db_xyz789",
  "synced_count": 12,
  "workspace": "My Workspace"
}
```
