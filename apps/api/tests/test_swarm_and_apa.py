import pytest
from services import apa_resume, swarm, resume_parser


def test_apa_resume_generator():
    profile = {
        "name": "Jane Doe",
        "headline": "Senior AI Systems Engineer",
        "email": "jane@example.com",
        "location": "San Francisco, CA",
        "years": 4,
        "education": "M.S. in Computer Science, Stanford University",
        "skills": ["python", "pytorch", "fastapi", "rag", "docker"],
        "projects": [
            {
                "name": "Autonomous Agent Workforce",
                "tech": ["python", "redis", "fastapi"],
                "text": "Engineered distributed task queue supporting 1,000 workers."
            }
        ],
        "evidence": [
            {"source": "GitHub", "text": "Built multi-agent architecture with zero hallucinations."}
        ]
    }

    text = apa_resume.generate_apa_text(profile)
    assert "RUNNING HEAD: DOE / CURRICULUM VITAE" in text
    assert "Jane Doe" in text
    assert "Professional Summary" in text
    assert "Education and Academic Credentials" in text
    assert "Software Artifacts and Project Contributions" in text
    assert "Doe. (" in text  # APA citation style

    html = apa_resume.generate_apa_html(profile)
    assert "<!DOCTYPE html>" in html
    assert "RUNNING HEAD: DOE / RESUME" in html
    assert "apa-citation" in html


def test_swarm_bots_distribution():
    profile = {"skills": ["python"], "headline": "AI Engineer"}
    run = swarm.Run(profile, ["AI Engineer"], workers=1000)

    # Check bot distribution: 300 scraper bots, 300 tailor bots, 400 apply bots
    scrapers = [b for b in run.bots.values() if b.pool == "discovery"]
    tailors = [b for b in run.bots.values() if b.pool == "tailor"]
    appliers = [b for b in run.bots.values() if b.pool == "apply"]

    assert len(scrapers) == 300
    assert len(tailors) == 300
    assert len(appliers) == 400

    # Platforms represented
    platforms = {b.platform for b in scrapers}
    assert "LinkedIn" in platforms
    assert "JobStreet" in platforms
    assert "Indeed" in platforms

    # Check snapshot
    snap = run.snapshot()
    assert snap["workers"] == 1000
    assert snap["pools"]["scrapers_count"] == 300
    assert snap["pools"]["tailors_count"] == 300
    assert snap["pools"]["appliers_count"] == 400

    # Check single bot
    bot = run.get_bot("bot_scrape_001")
    assert bot is not None
    assert bot["id"] == "bot_scrape_001"
    assert bot["memory_mb"] > 0
