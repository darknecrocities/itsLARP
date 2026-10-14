import pytest
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from services import swarm, jobs, recommendations, database
from services.database import SessionLocal, ProfileRecord, AgentQuestionRecord

database.init_db()


def test_50k_swarm_scaling():
    profile = {
        "name": "Alex Vance",
        "headline": "Lead Systems Architect",
        "skills": ["python", "go", "kubernetes", "fastapi", "redis"],
        "years": 5,
        "target_roles": ["Staff Backend Engineer"],
        "target_companies": ["Anthropic", "Stripe"],
        "work_types": ["fulltime", "remote"]
    }
    # Test 50,000 bots scale
    run = swarm.Run(
        profile=profile,
        queries=["Staff Backend Engineer"],
        workers=50000,
        target_jobs=50000,
        target_roles=["Staff Backend Engineer"],
        target_companies=["Anthropic", "Stripe"],
        work_types=["fulltime", "remote"]
    )
    assert run.n == 50000
    assert run.target_jobs == 50000
    assert run.n_scrape == 15000
    assert run.n_tailor == 15000
    assert run.n_apply == 20000

    snap = run.snapshot()
    assert snap["workers"] == 50000
    assert snap["target_jobs"] == 50000
    assert snap["pools"]["scrapers_count"] == 15000
    assert snap["pools"]["tailors_count"] == 15000
    assert snap["pools"]["appliers_count"] == 20000
    assert len(snap["sample_bots"]) > 0


def test_stream_target_jobs_50k_capability():
    generated = jobs.stream_target_jobs(
        target_count=250,
        queries=["AI Systems Engineer"],
        target_companies=["OpenAI", "Anthropic"],
        work_types=["fulltime", "internship", "contract"]
    )
    assert len(generated) == 250
    companies = {j["company"] for j in generated}
    assert "OpenAI" in companies or "Anthropic" in companies
    types = {j["employment_type"] for j in generated}
    assert any("Intern" in t or "Full-time" in t or "Contract" in t for t in types)


def test_recommendations_and_auto_apply():
    profile = {
        "name": "Jane Developer",
        "headline": "AI Engineer",
        "skills": ["python", "fastapi"],
        "years": 3,
        "projects": [{"name": "AI Agent Orchestrator", "tech": ["python", "fastapi"], "text": "Built agent tool"}],
        "target_roles": ["all"],
        "work_types": ["fulltime"],
        "evidence": []
    }
    recs = recommendations.generate_recommendations(profile)
    assert len(recs) >= 2
    skill_rec = next((r for r in recs if r["type"] == "skill_gap"), None)
    assert skill_rec is not None
    assert "skills" in skill_rec["changes"]

    # Test auto-apply
    updated = recommendations.apply_recommendation_to_profile(skill_rec["changes"], profile)
    for s in skill_rec["changes"]["skills"]:
        assert s in updated["skills"]
    assert len(updated["evidence"]) >= 1


def test_agent_clarification_question_workflow():
    db = SessionLocal()
    q_id = "test_q_123"
    try:
        # 1. Create a question
        q_rec = AgentQuestionRecord(
            id=q_id,
            company="Anthropic",
            role="AI Safety Engineer",
            question="Do you have 3+ years experience with PyTorch and distributed training?",
            context="Application autofill requirement",
            status="pending"
        )
        db.add(q_rec)
        db.commit()

        # 2. Query pending questions
        pending = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == q_id).first()
        assert pending is not None
        assert pending.status == "pending"

        # 3. Answer question and verify
        pending.status = "answered"
        pending.answer = "Yes, verified 4 years of PyTorch on multi-GPU nodes."
        db.commit()

        answered = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == q_id).first()
        assert answered.status == "answered"
        assert "multi-GPU" in answered.answer
    finally:
        # Cleanup
        db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == q_id).delete()
        db.commit()
        db.close()
