"""Automated verification suite for:
1. Live Career DNA Web Crawler & LLM Constructor (/profile/crawl-and-construct, /profile/refine-section)
2. 5 Resume Formats & Dynamic Per-Job Bot Tailoring (/profile/render-resume)
3. 20 Application Configuration Parameters in /applications/prepare
4. Parallel Find -> Construct -> Apply Swarm Pipeline with SQLite persistence
"""
import time
from fastapi.testclient import TestClient
from main import app
from services import resume_formats

client = TestClient(app)

SYNTHETIC_CANDIDATE = {
    "name": "Jordan Vance",
    "headline": "Staff Distributed Systems & AI Engineer",
    "email": "jordan.vance.qa@example.org",
    "phone": "+1-555-019-2834",
    "location": "Remote",
    "years": 7,
    "education": "M.S. in Computer Science, Distributed Computing",
    "summary": "Systems architect specializing in high-throughput backend infrastructure and AI workflows.",
    "skills": ["Go", "Rust", "Python", "Kubernetes", "PostgreSQL", "PyTorch", "FastAPI", "TypeScript"],
    "experience": [
        {
            "company": "CloudScale Systems",
            "title": "Staff Backend Engineer",
            "text": "Architected distributed consensus services and low-latency API gateways in Go and Python."
        }
    ],
    "projects": [
        {
            "name": "VectorStream-Engine",
            "tech": ["Python", "PyTorch", "FastAPI"],
            "text": "High-concurrency inference router for local and cloud LLM pipelines."
        },
        {
            "name": "KubeMesh-Orchestrator",
            "tech": ["Go", "Kubernetes", "Docker"],
            "text": "Zero-downtime container scheduler across multi-region clusters."
        }
    ],
    "links": {
        "github": "https://github.com/octocat",
        "linkedin": "https://linkedin.com/in/jordan-vance-qa",
        "portfolio": "https://example.com"
    },
    "evidence": [
        {
            "source": "GitHub Repository: VectorStream-Engine",
            "text": "Jordan Vance engineered VectorStream-Engine using Python, PyTorch, FastAPI, Kubernetes, and PostgreSQL."
        }
    ]
}


def test_five_resume_formats_and_job_tailoring():
    job = {
        "id": "job-ai-test-01",
        "title": "Principal AI Infrastructure Engineer",
        "company": "NexusAI Labs",
        "skills": ["PyTorch", "FastAPI", "Python", "Kubernetes"],
        "description": "Seeking a Principal AI Infrastructure Engineer skilled in PyTorch, FastAPI, Python, and Kubernetes."
    }

    for fmt in ["apa_7th", "harvard_executive", "silicon_valley_modern", "ieee_engineering", "ats_strict"]:
        r = client.post("/profile/render-resume", json={
            "profile": SYNTHETIC_CANDIDATE,
            "format": fmt,
            "job": job,
            "config": {
                "resumeFormat": fmt,
                "bulletRewriteAggressiveness": "aggressive",
                "skillGroupingMode": "relevance_first",
                "projectHighlightCount": 2,
                "quantifiableMetricsEmphasis": True,
                "keywordMirroringLevel": "exact",
                "pageDensity": "compact",
            }
        })
        assert r.status_code == 200
        data = r.json()
        assert data["format"] == fmt
        assert "jordan vance" in data["text"].lower()
        assert "nexusai labs" in data["text"].lower()
        assert "<html" in data["html"].lower()
        # Verify job-matched skills were dynamically reordered to the front
        tailored_skills = data["tailored_profile"]["skills"]
        assert tailored_skills[0] in ("Python", "Kubernetes", "PyTorch", "FastAPI")


def test_crawl_and_construct_dna_and_refine():
    r = client.post("/profile/crawl-and-construct", json={
        "github_url": "https://github.com/octocat",
        "linkedin_url": "https://linkedin.com/in/jordan-vance-qa",
        "linkedin_text": "Staff Engineer experienced in Python, FastAPI, Docker, and Kubernetes.",
        "portfolio_url": "https://example.com",
        "custom_instructions": "Emphasize backend systems and cloud infrastructure."
    })
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert "profile" in body
    assert isinstance(body["profile"]["skills"], list)
    assert len(body["profile"]["skills"]) > 0

    ref = client.post("/profile/refine-section", json={
        "section": "Summary",
        "current_value": "Software engineer working on backend systems.",
        "instruction": "Make it executive and concise.",
        "profile_context": SYNTHETIC_CANDIDATE,
    })
    assert ref.status_code == 200
    assert ref.json()["ok"] is True
    assert len(ref.json()["refined_text"]) > 10


def test_20_configs_in_prepare_application():
    jobs_res = client.get("/jobs?q=Engineer")
    assert jobs_res.status_code == 200
    jobs_list = jobs_res.json()
    assert len(jobs_list) > 0
    target_job_id = jobs_list[0]["id"]

    config_20 = {
        "resumeFormat": "ieee_engineering",
        "bulletRewriteAggressiveness": "balanced",
        "skillGroupingMode": "categorized",
        "projectHighlightCount": 2,
        "quantifiableMetricsEmphasis": True,
        "keywordMirroringLevel": "exact",
        "pageDensity": "compact",
        "coverLetterTone": "executive",
        "coverLetterMaxWords": 150,
        "compensationStrategy": "explicit_floor",
        "minimumBaseSalary": 165000,
        "workAuthorization": "authorized_no_sponsor",
        "noticePeriod": "immediate",
        "relocationWillingness": "no_remote_only",
        "minMatchThreshold": 50,
        "remoteWorkplacePreference": "remote_preferred",
        "companyBlacklist": "ForbiddenCorp",
        "maxDailyApplications": 50,
        "autoApproveThreshold": 70,
        "humanInTheLoopPause": False,
    }

    prep = client.post("/applications/prepare", json={
        "profile": SYNTHETIC_CANDIDATE,
        "job_id": target_job_id,
        "config": config_20,
    })
    assert prep.status_code == 200
    pdata = prep.json()
    assert pdata["resume_format"] == "ieee_engineering"
    assert "IEEE ENGINEERING CURRICULUM VITAE" in pdata["resume_text"]
    assert "$165,000+ USD" in pdata["answers"]["Compensation expectation"]
    assert "Immediately available" in pdata["answers"]["Notice period / Availability"]


def test_parallel_swarm_find_construct_and_apply():
    # Clear applications before swarm test
    client.post("/applications/clear")

    start_res = client.post("/swarm/start", json={
        "profile": SYNTHETIC_CANDIDATE,
        "queries": ["Engineer"],
        "workers": 100,
        "target_jobs": 5,
        "app_config": {
            "resumeFormat": "silicon_valley_modern",
            "minMatchThreshold": 40,
            "autoApproveThreshold": 50,
            "humanInTheLoopPause": False,
            "maxDailyApplications": 10,
        }
    })
    assert start_res.status_code == 200
    run_id = start_res.json()["id"]

    # Wait for async workers to complete discovery -> analysis -> matching -> resumes -> applications
    for _ in range(50):
        snap = client.get(f"/swarm/{run_id}").json()
        if snap["status"] in ("completed", "stopped") or snap["ready"] > 0:
            break
        time.sleep(0.2)

    results = client.get(f"/swarm/{run_id}/results").json()
    assert len(results) > 0

    apps = client.get("/applications").json()
    assert len(apps) > 0
    # Verify tailored resume was constructed and saved by parallel bot
    first_app = apps[0]
    assert first_app["status"] in ("APPLIED", "READY")
    assert len(first_app.get("resume", "")) > 50
