import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ollama_status_endpoint():
    response = client.get("/ai/ollama/status")
    assert response.status_code == 200
    data = response.json()
    assert "installed" in data
    assert "running" in data
    assert "port" in data
    assert data["port"] == 11434
    assert "models" in data
    assert isinstance(data["models"], list)

def test_recommended_models_endpoint():
    response = client.get("/ai/models/recommended")
    assert response.status_code == 200
    data = response.json()
    assert "recommended" in data
    models = data["recommended"]
    assert len(models) >= 5

    # Verify categories and performance vs ability metrics
    categories = {m["category"] for m in models}
    assert "performance" in categories
    assert "balanced" in categories
    assert "ability" in categories

    for m in models:
        assert "name" in m
        assert "size" in m
        assert "min_ram" in m
        assert "rec_ram" in m
        assert "speed_score" in m
        assert "ability_score" in m
        assert "best_for" in m

    # Check that qwen2.5-coder:7b is marked as default
    default_model = next((m for m in models if m["name"] == "qwen2.5-coder:7b"), None)
    assert default_model is not None
    assert default_model["is_default"] is True

def test_ollama_install_instructions():
    response = client.post("/ai/ollama/install", json={"os_target": "darwin"})
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "Ollama-darwin.zip" in data["installer_url"]

    response_win = client.post("/ai/ollama/install", json={"os_target": "windows"})
    assert response_win.status_code == 200
    data_win = response_win.json()
    assert data_win["ok"] is True
    assert "OllamaSetup.exe" in data_win["installer_url"]
