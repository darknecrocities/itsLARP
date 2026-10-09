import sys
import pathlib
import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from services import resume_parser, jobs, swarm, tailoring
from services.ai_gateway import ai_gateway
from services.database import init_db, SessionLocal, JobRecord


def test_resume_parser():
    sample_text = """
    Arron Parejas
    AI Systems Engineer
    arron@example.com
    Manila, Philippines
    5 years of experience building Python and FastAPI microservices.
    
    Skills:
    Python, FastAPI, PyTorch, Docker, Kubernetes, PostgreSQL, Redis, RAG, LLM
    
    Projects:
    Autonomous Multi-Agent Swarm
    Engineered an asynchronous task workforce using Redis queues and Python.
    
    Links:
    github.com/arronkianparejas
    linkedin.com/in/arronkianparejas
    """
    res = resume_parser.parse_resume_content(sample_text)
    assert res["name"] == "Arron Parejas"
    assert "python" in res["skills"]
    assert "fastapi" in res["skills"]
    assert res["years"] == 5
    assert len(res["evidence"]) >= 1


@pytest.mark.anyio
async def test_job_discovery_and_import():
    init_db()
    job = await jobs.import_custom_job(
        url="https://example.com/careers/ai-lead",
        title="Lead AI Engineer",
        company="NeuroTech Inc",
        raw_text="Looking for a Lead AI Engineer with 4+ years in Python, PyTorch, RAG, and FastAPI."
    )
    assert job["id"] is not None
    assert "python" in job["skills"]
    assert "rag" in job["skills"]

    fetched = jobs.get_job(job["id"])
    assert fetched is not None
    assert fetched["company"] == "NeuroTech Inc"


@pytest.mark.anyio
async def test_swarm_lifecycle():
    profile = {
        "name": "Alex Vance",
        "headline": "AI Engineer",
        "skills": ["python", "fastapi", "docker", "llm", "rag"],
        "years": 3,
        "projects": [{"name": "RAG Agent", "tech": ["python", "rag"]}],
        "evidence": [{"source": "Resume", "text": "Built RAG systems with Python and FastAPI"}]
    }
    run = swarm.Run(profile, ["AI Engineer"], workers=10)
    run.start()
    assert run.snapshot()["status"] == "running"
    run.stop()
    assert run.snapshot()["status"] == "stopped"
