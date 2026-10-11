# Local LLM Integration & AI Gateway

## Overview

**itsLARP / HowToLarped** is designed with a **Local AI First** architectural philosophy. All core generative and extraction workloads—including resume parsing, candidate DNA synthesis, job requirement analysis, and tailored document drafting—can execute completely offline using local open-weight models via **Ollama**.

---

## 1. Why Local AI First?

1. **Zero Marginal Cost**: Run 1,000 bots tailoring hundreds of resumes without racking up third-party token bills.
2. **Total Data Privacy**: Your career history, contact details, and resume files never leave your personal machine.
3. **Low Latency & High Throughput**: Local inference avoids API rate limits, HTTP latency spikes, and cloud outages.
4. **Graceful Fallbacks**: If local models are unavailable, the gateway falls back seamlessly to deterministic heuristic parsers or optional cloud API keys.

---

## 2. Recommended Local Models

We recommend the following models for running on Ollama:

| Model | Parameter Size | Memory (VRAM / RAM) | Strengths |
|---|---|---|---|
| **`qwen2.5-coder:7b`** *(Recommended)* | 7 Billion | ~5.5 GB | Outstanding code extraction, JSON adherence, and technical skill parsing. |
| **`llama3.2:3b`** | 3 Billion | ~2.5 GB | Ultra-fast inference, ideal for lightweight laptops and high-throughput batching. |
| **`gemma3:4b`** | 4 Billion | ~3.2 GB | Balanced reasoning and natural English document synthesis. |
| **`qwen2.5:0.5b`** | 500 Million | ~600 MB | Minimalist testing model for resource-constrained environments. |

---

## 3. Quickstart: Setting Up Ollama

### Step 1: Install Ollama
- **macOS**: `brew install ollama` or download from [ollama.ai](https://ollama.ai)
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`
- **Windows**: Download official installer from [ollama.ai](https://ollama.ai)

### Step 2: Pull and Run Recommended Model
```bash
# Pull our primary recommended coding & reasoning model
ollama run qwen2.5-coder:7b
```

Ollama will start an HTTP inference server listening on `http://localhost:11434`.

### Step 3: Verification
Open your browser or run:
```bash
curl http://localhost:11434/api/tags
```
You should see a JSON response listing installed models. The itsLARP backend detects Ollama models automatically.

---

## 4. AI Gateway Architecture

The gateway abstraction is implemented in [`apps/api/services/ai_gateway.py`](file:///Users/arronkianparejas/itsLarper/apps/api/services/ai_gateway.py):

```python
from services.ai_gateway import ai_gateway

# Generate completion with automatic provider dispatch
response = await ai_gateway.generate(
    prompt="Extract candidate skills from the following text...",
    system="You are an expert technical recruiter...",
    max_tokens=1000,
    temperature=0.1
)
```

### Auto-Detection & Provider Configuration
- When started, `ai_gateway.get_status()` queries `http://localhost:11434/api/tags`.
- If connected, it automatically switches to the best installed model.
- Users can change models or providers on the fly in the `/settings` page:
  - **Ollama** (Local default)
  - **Google Gemini** (`gemini-1.5-flash` or `gemini-2.0-flash`)
  - **OpenAI** (`gpt-4o-mini`)
  - **Anthropic** (`claude-3-5-haiku`)

---

## 5. Candidate Extraction Prompt Specification

When a user uploads a resume, GitHub username, and LinkedIn text, the gateway formats a strict JSON-constrained prompt:

```json
{
  "name": "Full Name",
  "headline": "Professional Title / Headline",
  "email": "Email address",
  "location": "City, Country or Remote",
  "years": 3,
  "education": "Degree and University",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    {"company": "Company", "title": "Role", "text": "Key achievements and responsibilities"}
  ],
  "projects": [
    {"name": "Project Name", "tech": ["Tech1", "Tech2"], "text": "What was built and key metrics"}
  ],
  "target_roles": ["Desired Role 1", "Desired Role 2"],
  "summary": "Professional summary statement"
}
```

If the LLM returns invalid JSON or is offline, the backend's deterministic heuristic engine extracts skills and contact information, ensuring **100% uptime and zero crashes**.
