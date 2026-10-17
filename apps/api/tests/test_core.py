import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from services import scoring, verification, dedupe

CAND = {"skills": ["Python", "FastAPI"], "years_experience": 4, "projects": [{"tech": ["Python", "FastAPI"]}],
        "education_level": 2, "domains": ["ai"], "location": "Manila"}
JOB = {"skills": ["python", "fastapi"], "years_required": 3, "education_level": 2, "domain": "ai", "remote": True}


def test_score_excellent():
    r = scoring.score_match(CAND, JOB)
    assert r.score >= 90 and r.label == "Excellent"


def test_score_missing_skills():
    r = scoring.score_match(CAND, {**JOB, "skills": ["rust", "go"]})
    assert r.score < 90 and r.missing == ["go", "rust"]


def test_verify_blocks_unsupported():
    ev = [{"source": "resume", "text": "Built Python APIs with FastAPI at Acme"}]
    r = verification.verify("Led a team of 10 engineers", ev)
    assert not r["passed"] and r["claims"][0]["status"] == "BLOCKED"


def test_verify_passes_supported():
    ev = [{"source": "resume", "text": "Built Python APIs with FastAPI at Acme"}]
    assert verification.verify("Built Python APIs with FastAPI", ev)["passed"]


def test_dedupe_merges():
    jobs = [{"company": "X", "title": "AI Engineer", "location": "Remote", "source": "a"},
            {"company": "x ", "title": "AI  Engineer", "location": "remote", "source": "b"}]
    out = dedupe.dedupe(jobs)
    assert len(out) == 1 and out[0]["sources"] == ["a", "b"]


def test_job_discovery_and_filtering():
    import asyncio
    from services import jobs
    found, _ = asyncio.run(jobs.discover("Project Manager"))
    assert len(found) > 0
    # Every synthesized job must be relevant to Project Manager
    for j in found:
        assert "project" in j["title"].lower() or "manager" in j["title"].lower()

    # Test filtering by employment type
    contract_only = jobs.filter_jobs(found, employment_type="Contract")
    assert all("contract" in (j.get("employment_type") or "").lower() for j in contract_only)

    # Test filtering by experience level
    senior_only = jobs.filter_jobs(found, experience_level="senior")
    assert all(j.get("years", 1) >= 5 or "senior" in j["title"].lower() for j in senior_only)

    # Test filtering by platforms
    linkedin_only = jobs.filter_jobs(found, platforms=["LinkedIn"])
    assert all("linkedin" in (j.get("source") or "").lower() for j in linkedin_only)

