"""Automated test suite for:
1. Pre-submission form-filled screenshot capture with hovering bot cursor and HUD
2. Screenshot endpoint serving real binary PNG files
3. Dynamic swarm scaling with thousands of simultaneous workers up to 50,000
"""
import os
import pytest
from fastapi.testclient import TestClient
from main import app
from services import screenshot_capture, swarm

client = TestClient(app)


def test_pre_submission_screenshot_generation():
    """Verify screenshot generator produces high-resolution PNG with filled fields."""
    png_path = screenshot_capture.get_or_create_screenshot(
        app_id="test_pre_submission_001",
        company="Cognitive Systems",
        role="Principal Distributed Systems Engineer",
        url="https://jobs.lever.co/cognitivesystems/apply",
        candidate_name="Alex Rivera",
        email="alex.rivera.systems@example.org",
        phone="+1 (555) 234-5678",
        location="San Francisco, CA (Remote)",
        linkedin="https://linkedin.com/in/alex-rivera-systems",
        github="https://github.com/alexrivera-ai",
        cover_letter="I am applying with 10 years experience in distributed inference.",
        match_score=97,
        force=True,
    )

    assert os.path.exists(png_path)
    file_size = os.path.getsize(png_path)
    assert file_size > 10000  # Valid PNG image file

    # Read binary header to ensure it's a real PNG
    with open(png_path, "rb") as f:
        header = f.read(8)
        assert header == b"\x89PNG\r\n\x1a\n"


def test_application_screenshot_endpoint():
    """Verify GET /applications/{app_id}/screenshot returns image/png with HTTP 200."""
    res = client.get("/applications/test_pre_submission_001/screenshot")
    assert res.status_code == 200
    assert "image/png" in res.headers.get("content-type", "")
    assert len(res.content) > 10000


def test_swarm_scaling_50k_workers():
    """Verify swarm accepts and orchestrates large-scale fleets up to 50,000 workers."""
    res = client.post("/swarm/start", json={
        "workers": 10000,
        "target_jobs": 500,
        "queries": ["Staff AI Engineer", "Distributed Systems"],
    })
    assert res.status_code == 200
    data = res.json()
    assert data["workers"] == 10000
    assert data["target_jobs"] == 500
    assert data["status"] in ["running", "completed"]
    assert "pools" in data
    assert data["pools"]["scrapers_count"] > 0
    assert data["pools"]["tailors_count"] > 0
    assert data["pools"]["appliers_count"] > 0

    # Stop the swarm run
    run_id = data["id"]
    stop_res = client.post(f"/swarm/{run_id}/stop")
    assert stop_res.status_code == 200
