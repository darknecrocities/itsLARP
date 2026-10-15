import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import pytest
from fastapi.testclient import TestClient
from main import app
from services.database import SessionLocal, ApplicationRecord, IntegrationRecord


client = TestClient(app)


def test_duplicate_application_prevention():
    db = SessionLocal()
    try:
        # Create an existing applied record
        existing = db.query(ApplicationRecord).filter(ApplicationRecord.job_id == "test_dup_01").first()
        if not existing:
            existing = ApplicationRecord(
                id="a-test_dup_01",
                job_id="test_dup_01",
                company="Anthropic AI Systems",
                role="Principal Researcher",
                status="APPLIED",
                match=95
            )
            db.add(existing)
            db.commit()

        # Check endpoint
        res = client.get("/applications/check?job_id=test_dup_01")
        assert res.status_code == 200
        data = res.json()
        assert data["has_application"] is True
        assert data["is_ongoing"] is True
        assert data["can_reapply"] is False
        assert "Already applied" in data["message"]

        # Attempt duplicate approve without force
        dup_attempt = client.post("/applications/approve", json={
            "job_id": "test_dup_01",
            "company": "Anthropic AI Systems",
            "role": "Principal Researcher",
            "match": 95,
            "force_reapply": False
        })
        assert dup_attempt.status_code == 200
        dup_data = dup_attempt.json()
        assert dup_data["ok"] is False
        assert dup_data["duplicate"] is True
        assert "Duplicate application prevented" in dup_data["message"]
    finally:
        db.close()


def test_reapply_after_rejection():
    db = SessionLocal()
    try:
        rec = db.query(ApplicationRecord).filter(ApplicationRecord.job_id == "test_rej_02").first()
        if not rec:
            rec = ApplicationRecord(
                id="a-test_rej_02",
                job_id="test_rej_02",
                company="OpenAI Distributed",
                role="Kernel Engineer",
                status="REJECTED",
                match=90
            )
            db.add(rec)
        else:
            rec.status = "REJECTED"
        db.commit()


        # Check endpoint
        res = client.get("/applications/check?job_id=test_rej_02")
        assert res.status_code == 200
        data = res.json()
        assert data["has_application"] is True
        assert data["is_ongoing"] is False
        assert data["is_terminal"] is True
        assert data["can_reapply"] is True

        # Trigger reapply endpoint
        reapply_res = client.post("/applications/a-test_rej_02/reapply")
        assert reapply_res.status_code == 200
        reapply_data = reapply_res.json()
        assert reapply_data["ok"] is True
        assert reapply_data["status"] == "READY"

        # Now approve with force_reapply
        approve_res = client.post("/applications/approve", json={
            "job_id": "test_rej_02",
            "company": "OpenAI Distributed",
            "role": "Kernel Engineer",
            "match": 90,
            "force_reapply": True
        })
        assert approve_res.status_code == 200
        assert approve_res.json()["ok"] is True
        assert approve_res.json()["status"] == "APPLIED"
    finally:
        db.close()


def test_notion_status_and_masking():
    res = client.get("/integrations/notion/status")
    assert res.status_code == 200
    data = res.json()
    assert "connected" in data
    assert "database_id" in data
    assert "token_masked" in data


def test_dna_applications_generation():
    from services.dna_sync import generate_dna_applications
    candidate = {
        "name": "Taylor Engineer",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
        "target_companies": ["Anthropic", "OpenAI", "Vercel", "Stripe", "Databricks"],
        "years": 4
    }
    apps = generate_dna_applications(candidate, target_count=5)
    assert len(apps) == 5
    for a in apps:
        assert a["company"] in ["Anthropic", "OpenAI", "Vercel", "Stripe", "Databricks"]
        assert len(a["company_background"]) > 10
        assert a["company_linkedin"].startswith("https://www.linkedin.com/company/")
        assert a["match"] >= 70
        assert a["resume_url"].startswith("http")


def test_sync_dna_applications_endpoint():
    res = client.post("/integrations/notion/sync-dna-applications", json={"target_count": 3})
    assert res.status_code in [200, 400]
    if res.status_code == 200:
        data = res.json()
        assert "total_generated" in data
    else:
        assert "Notion is not configured yet" in res.json()["detail"]


def test_clear_applications_endpoint():
    res = client.post("/applications/clear")
    assert res.status_code == 200
    assert res.json()["ok"] is True

