# Contributing to itsLARP / HowToLarped

Thank you for your interest in contributing to **itsLARP / HowToLarped**! We welcome contributions from developers, researchers, designers, and open-source enthusiasts.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect and professionalism.

---

## 2. Getting Started

### 2.1 Fork & Clone
```bash
git clone https://github.com/darknecrocities/itsLARP.git
cd itsLARP
```

### 2.2 Setup Backend Virtual Environment
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2.3 Setup Frontend
```bash
cd ../web
npm install
```

### 2.4 Run Development Environment
From the root directory, start both the FastAPI backend and Next.js frontend with one command:
```bash
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- FastAPI Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. Core Architectural Rules for Contributors

When submitting pull requests, ensure adherence to our non-negotiable principles:

1. **Anti-Hallucination Integrity**:
   AI generation MUST trace back to verified candidate evidence. Never bypass or disable the claim verification gate in [`services/verification.py`](file:///Users/arronkianparejas/itsLarper/apps/api/services/verification.py).
2. **Local AI First**:
   All features must work with local Ollama open-weight models (`qwen2.5-coder:7b` or `llama3.2`). Never introduce hard dependencies on paid cloud APIs.
3. **Safety Boundary**:
   Applications must never be auto-submitted without explicit human approval. Keep all applications stopping at `READY_FOR_REVIEW`.
4. **Lightweight Bot Footprint**:
   Task workers in the 1,000-bot swarm must remain lightweight (~1.2 MB RAM). Avoid heavy in-process headless browser allocations for background tasks.
5. **Design Aesthetics**:
   Maintain the minimalist Swiss design system: clean Black, White, and Gray tones, Space Grotesk / Inter / JetBrains Mono typography.

---

## 4. Git Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature (e.g. `feat: add APA 7th edition resume generator`)
- `fix:` A bug fix (e.g. `fix: handle 2FA prompt in LinkedIn crawler bot`)
- `docs:` Documentation improvements (e.g. `docs: add local LLM setup guide`)
- `test:` Adding or updating unit tests (e.g. `test: add tests for swarm bot telemetry`)
- `refactor:` Code improvements without behavioral changes
- `chore:` Build scripts or dependency updates

---

## 5. Running Tests

Before opening a pull request, verify that all backend tests pass:

```bash
cd apps/api
.venv/bin/pytest tests
```

And verify that Next.js compiles without TypeScript or lint errors:

```bash
cd apps/web
npm run build
```

---

## 6. Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature-name`.
2. Make your changes and commit with conventional messages.
3. Push to your fork: `git push origin feat/your-feature-name`.
4. Open a Pull Request targeting the `main` branch on GitHub.
5. Provide a clear description of the problem solved, testing methodology, and screenshots/GIFs if UI changes were made.
