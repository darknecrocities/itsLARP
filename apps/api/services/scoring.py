"""Deterministic candidate/job matching. Never decided solely by an LLM."""
from dataclasses import dataclass

WEIGHTS = {"skills": 0.35, "experience": 0.25, "projects": 0.15,
           "education": 0.10, "domain": 0.10, "location": 0.05}


@dataclass
class MatchResult:
    score: int
    label: str
    breakdown: dict
    strong: list
    missing: list


def classify(score: int) -> str:
    if score >= 90: return "Excellent"
    if score >= 80: return "Strong"
    if score >= 70: return "Good"
    if score >= 60: return "Consider"
    return "Low priority"


def _overlap(have: set, need: set) -> float:
    return 1.0 if not need else len(have & need) / len(need)


def score_match(candidate: dict, job: dict, embedding_sim: float = 0.0) -> MatchResult:
    have = {s.lower() for s in candidate.get("skills", [])}
    need = {s.lower() for s in job.get("skills", [])}
    exp_need = max(job.get("years_required", 0), 0)
    exp_have = candidate.get("years_experience", 0)
    exp = 1.0 if exp_need == 0 else min(exp_have / exp_need, 1.0)
    proj_tech = {t.lower() for p in candidate.get("projects", []) for t in p.get("tech", [])}
    projects = _overlap(proj_tech, need)
    education = 1.0 if candidate.get("education_level", 0) >= job.get("education_level", 0) else 0.5
    domain = 1.0 if job.get("domain") in candidate.get("domains", []) else 0.4
    loc = 1.0 if job.get("remote") or job.get("location") == candidate.get("location") else 0.3
    skills = _overlap(have, need)
    # embedding similarity nudges the skills component only (bounded)
    skills = min(1.0, 0.85 * skills + 0.15 * max(0.0, min(embedding_sim, 1.0)))
    parts = {"skills": skills, "experience": exp, "projects": projects,
             "education": education, "domain": domain, "location": loc}
    total = round(100 * sum(WEIGHTS[k] * v for k, v in parts.items()))
    return MatchResult(total, classify(total), {k: round(v * 100) for k, v in parts.items()},
                       sorted(have & need), sorted(need - have))
