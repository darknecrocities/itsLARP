"""CLAIM -> EVIDENCE -> VERIFICATION. Unsupported claims are BLOCKED.
Rule: Never introduce unsupported professional claims.
"""
import re
from dataclasses import dataclass, asdict

BOILERPLATE = re.compile(
    r"^(dear\b|sincerely\b|thank you\b|i look forward\b|regards\b|best\b|i am writing\b|i am excited to apply\b)",
    re.I
)


@dataclass
class Claim:
    claim: str
    source: str | None
    confidence: float
    status: str  # VERIFIED | BLOCKED


def extract_claims(text: str) -> list[str]:
    claims = []
    for raw in re.split(r"[.\n•]+", text):
        cleaned = raw.strip()
        # Must be at least 3 words and not epistolary boilerplate
        if len(cleaned.split()) >= 3 and not BOILERPLATE.search(cleaned):
            claims.append(cleaned)
    return claims


def _evidence_for(claim: str, evidence: list[dict]) -> tuple[str | None, float]:
    words = {w for w in re.findall(r"[a-z0-9+#.]+", claim.lower()) if len(w) > 2}
    best, best_score = None, 0.0
    for ev in evidence:
        ew = set(re.findall(r"[a-z0-9+#.]+", ev["text"].lower()))
        score = len(words & ew) / max(len(words), 1)

        # Numbers/metrics in the claim must be backed by evidence
        claim_nums = set(re.findall(r"\b\d+[\d,.]*\b", claim))
        ev_nums = set(re.findall(r"\b\d+[\d,.]*\b", ev["text"]))
        if claim_nums and not claim_nums.issubset(ev_nums):
            score *= 0.2

        if score > best_score:
            best, best_score = ev["source"], score

    return best, best_score


def verify(text: str, evidence: list[dict], threshold: float = 0.5) -> dict:
    results = []
    for c in extract_claims(text):
        src, conf = _evidence_for(c, evidence)
        ok = conf >= threshold
        results.append(Claim(c, src if ok else None, round(conf, 2), "VERIFIED" if ok else "BLOCKED"))
    blocked = [r for r in results if r.status == "BLOCKED"]
    return {
        "passed": len(blocked) == 0,
        "claims": [asdict(r) for r in results],
        "blocked": len(blocked)
    }
