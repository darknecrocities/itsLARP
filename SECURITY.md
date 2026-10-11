# Security Policy & Data Privacy

## 1. Security Architecture

**itsLARP / HowToLarped** is designed from the ground up around strict data isolation, candidate privacy, and defensive boundaries.

### Local AI First & Zero Data Leakage
- Generative tasks and resume parsing default to **local open-weight models** via Ollama.
- Your resume content, contact information, employment history, and notes never leave your personal computer or local server.
- No training telemetry is transmitted to third parties.

### Anti-Hallucination Gate
- The system employs an evidence verification engine that maps all generated claims to raw source text extracted from candidate documents or GitHub repositories.
- Unsubstantiated claims are classified as blocked and prevented from being included in application packages.

### Human Approval Safety Boundary
- Autonomous workers are constrained to preparation, document tailoring, and staging.
- No application is ever submitted or marked finalized without explicit user approval.

### Credential & Token Protection
- External integration secrets (e.g. Notion integration tokens) are held in memory during the browser session and are never logged or stored in plain-text database fields.
- Platform session identifiers for job boards are masked and kept local to the worker instance.

---

## 2. Reporting a Vulnerability

If you discover a security issue or vulnerability in this repository, please do not disclose it publicly in issues or pull requests.

Instead, please email:
**parejasarronkian@gmail.com**

Please include:
1. Type of issue (e.g. token exposure, injection, bypass of verification gate)
2. Step-by-step instructions or PoC to reproduce
3. Impact assessment

We will acknowledge receipt within 48 hours and work with you to coordinate a responsible patch and advisory.
