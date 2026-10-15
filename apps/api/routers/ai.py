import os
import sys
import shutil
import subprocess
import httpx
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.ai_gateway import ai_gateway, OLLAMA_HOST

router = APIRouter(prefix="/ai", tags=["AI & Ollama"])

RECOMMENDED_MODELS = [
    {
        "name": "qwen2.5:1.5b",
        "category": "performance",
        "tier": "Ultra-Fast / Low RAM",
        "size": "0.9 GB",
        "params": "1.5B",
        "min_ram": "4 GB",
        "rec_ram": "8 GB",
        "speed_score": 9.8,
        "ability_score": 7.5,
        "best_for": "Ultra-fast matching, low-resource laptops, instant response",
        "is_default": False
    },
    {
        "name": "llama3.2:3b",
        "category": "performance",
        "tier": "Ultra-Fast / Low RAM",
        "size": "2.0 GB",
        "params": "3.2B",
        "min_ram": "6 GB",
        "rec_ram": "8 GB",
        "speed_score": 9.3,
        "ability_score": 8.1,
        "best_for": "Lightweight reasoning and general text summarization",
        "is_default": False
    },
    {
        "name": "qwen2.5-coder:1.5b",
        "category": "performance",
        "tier": "Ultra-Fast / Low RAM",
        "size": "1.0 GB",
        "params": "1.5B",
        "min_ram": "4 GB",
        "rec_ram": "8 GB",
        "speed_score": 9.6,
        "ability_score": 8.0,
        "best_for": "Instant code extraction & JSON schema parsing",
        "is_default": False
    },
    {
        "name": "qwen2.5-coder:7b",
        "category": "balanced",
        "tier": "Balanced Sweet Spot (Recommended Default)",
        "size": "4.7 GB",
        "params": "7.6B",
        "min_ram": "8 GB",
        "rec_ram": "16 GB",
        "speed_score": 8.9,
        "ability_score": 9.4,
        "best_for": "itsLARP primary engine: APA resume tailoring, skill matching, ATS optimization",
        "is_default": True
    },
    {
        "name": "llama3.1:8b",
        "category": "balanced",
        "tier": "Balanced Sweet Spot",
        "size": "4.9 GB",
        "params": "8.0B",
        "min_ram": "8 GB",
        "rec_ram": "16 GB",
        "speed_score": 8.5,
        "ability_score": 9.1,
        "best_for": "General career analysis, job role evaluation, and cover letter generation",
        "is_default": False
    },
    {
        "name": "gemma3:4b",
        "category": "balanced",
        "tier": "Balanced Sweet Spot",
        "size": "3.3 GB",
        "params": "4.3B",
        "min_ram": "8 GB",
        "rec_ram": "16 GB",
        "speed_score": 8.8,
        "ability_score": 8.9,
        "best_for": "Google architecture, high parameter efficiency, balanced reasoning",
        "is_default": False
    },
    {
        "name": "qwen2.5-coder:14b",
        "category": "ability",
        "tier": "Maximum Ability / Heavyweight",
        "size": "9.0 GB",
        "params": "14.7B",
        "min_ram": "16 GB",
        "rec_ram": "32 GB",
        "speed_score": 7.4,
        "ability_score": 9.8,
        "best_for": "Highest precision code review, enterprise resume tailoring, complex requirements",
        "is_default": False
    },
    {
        "name": "deepseek-r1:8b",
        "category": "ability",
        "tier": "Maximum Ability / Heavyweight",
        "size": "4.9 GB",
        "params": "8.0B",
        "min_ram": "10 GB",
        "rec_ram": "16 GB",
        "speed_score": 7.8,
        "ability_score": 9.5,
        "best_for": "Chain-of-thought reasoning and complex interview question preparation",
        "is_default": False
    }
]

def find_ollama_binary() -> Optional[str]:
    """Search for the ollama binary in PATH and common installation paths."""
    found = shutil.which("ollama")
    if found:
        return found
    candidates = [
        "/usr/local/bin/ollama",
        "/opt/homebrew/bin/ollama",
        os.path.expanduser("~/bin/ollama"),
        os.path.expanduser("~/.local/bin/ollama"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Ollama\ollama.exe"),
        r"C:\Program Files\Ollama\ollama.exe",
    ]
    for c in candidates:
        if os.path.exists(c) and os.access(c, os.X_OK if sys.platform != "win32" else os.F_OK):
            return c
    return None

@router.get("/status")
async def ai_status():
    return await ai_gateway.get_status()

class AIConfigIn(BaseModel):
    provider: str
    model: str
    api_key: Optional[str] = None

@router.post("/configure")
def ai_configure(b: AIConfigIn):
    ai_gateway.set_config(b.provider, b.model, b.api_key)
    return {"ok": True, "provider": ai_gateway.provider, "model": ai_gateway.model}
@router.get("/ollama/status")
async def ollama_status():
    """Detects Ollama binary presence, daemon connectivity, installed models and system environment."""
    binary_path = find_ollama_binary()
    installed = bool(binary_path)
    running = False
    models: List[str] = []
    version: Optional[str] = None

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{OLLAMA_HOST}/api/tags")
            if res.status_code == 200:
                running = True
                data = res.json()
                models = [m["name"] for m in data.get("models", [])]
            v_res = await client.get(f"{OLLAMA_HOST}/api/version")
            if v_res.status_code == 200:
                version = v_res.json().get("version")
    except Exception:
        running = False

    if not version and binary_path:
        try:
            out = subprocess.check_output([binary_path, "--version"], text=True, timeout=2.0)
            if "version" in out:
                version = out.strip().split()[-1]
        except Exception:
            pass

    return {
        "installed": installed,
        "running": running,
        "version": version or "0.33.2" if running else None,
        "binary_path": binary_path,
        "port": 11434,
        "host": OLLAMA_HOST,
        "models": models,
        "models_count": len(models),
        "os": sys.platform,
        "hardware_tier": "Apple Silicon (Metal GPU)" if sys.platform == "darwin" else "x86_64 CPU/GPU"
    }

@router.get("/models/recommended")
def get_recommended_models():
    """Returns curated models with speed vs ability attributes."""
    return {"recommended": RECOMMENDED_MODELS}

class PullModelIn(BaseModel):
    model: str = Field(..., min_length=2, max_length=100)

@router.post("/ollama/pull")
async def ollama_pull(b: PullModelIn):
    """Streams Ollama model download progress chunk-by-chunk."""
    target_model = b.model.strip()

    async def progress_stream():
        try:
            async with httpx.AsyncClient(timeout=1800.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_HOST}/api/pull",
                    json={"name": target_model, "stream": True}
                ) as response:
                    if response.status_code != 200:
                        yield f'{{"error": "Ollama returned status {response.status_code}"}}\n'
                        return
                    async for line in response.aiter_lines():
                        if line:
                            yield f"{line}\n"
        except Exception as e:
            yield f'{{"error": "Failed to stream model download: {str(e)}"}}\n'

    return StreamingResponse(progress_stream(), media_type="application/x-ndjson")

@router.post("/ollama/start")
def ollama_start():
    """Starts the background Ollama daemon if binary is installed."""
    binary = find_ollama_binary()
    if not binary:
        raise HTTPException(400, "Ollama is not installed on this system.")
    try:
        subprocess.Popen([binary, "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        return {"ok": True, "message": "Ollama service started in background"}
    except Exception as e:
        raise HTTPException(500, f"Could not start Ollama: {str(e)}")

class InstallOllamaIn(BaseModel):
    os_target: Optional[str] = None

@router.post("/ollama/install")
def ollama_install(b: Optional[InstallOllamaIn] = None):
    """Provides download links and automated triggers for Ollama installation."""
    plat = (b.os_target if b and b.os_target else sys.platform).lower()
    if "darwin" in plat or "mac" in plat:
        return {
            "ok": True,
            "os": "darwin",
            "installer_url": "https://ollama.com/download/Ollama-darwin.zip",
            "installer_filename": "Ollama-darwin.zip",
            "cli_command": "curl -fsSL https://ollama.com/install.sh | sh",
            "instructions": "Download and unzip Ollama-darwin.zip, then move Ollama.app to your Applications folder."
        }
    elif "win" in plat:
        return {
            "ok": True,
            "os": "windows",
            "installer_url": "https://ollama.com/download/OllamaSetup.exe",
            "installer_filename": "OllamaSetup.exe",
            "cli_command": "winget install Ollama.Ollama",
            "instructions": "Run OllamaSetup.exe and follow the on-screen installer instructions."
        }
    return {
        "ok": True,
        "os": "linux",
        "installer_url": "https://ollama.com/download/ollama-linux-amd64.tgz",
        "cli_command": "curl -fsSL https://ollama.com/install.sh | sh",
        "instructions": "Run the official shell installation script in your terminal."
    }

# --- LLM Recommendations ---

class RecIn(BaseModel):
    profile: dict = {}


@router.post("/recommendations")
def ai_recommendations(b: RecIn):
    from services import recommendations
    from services.database import SessionLocal, ProfileRecord

    p = b.profile
    if not p.get("name") and not p.get("skills"):
        db = SessionLocal()
        try:
            rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
            if rec:
                p = {
                    "name": rec.name,
                    "headline": rec.headline,
                    "skills": rec.skills or [],
                    "projects": rec.projects or [],
                    "years": rec.years or 2,
                    "target_roles": rec.target_roles or ["all"],
                    "work_types": rec.work_types or ["fulltime", "remote"],
                    "evidence": rec.evidence or []
                }
        finally:
            db.close()
    return recommendations.generate_recommendations(p)


class ApplyRecIn(BaseModel):
    rec_changes: dict
    profile: dict = {}


@router.post("/recommendations/apply")
def ai_recommendations_apply(b: ApplyRecIn):
    from services import recommendations
    from services.database import SessionLocal, ProfileRecord

    p = b.profile
    if not p.get("name") and not p.get("skills"):
        db = SessionLocal()
        try:
            rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
            if rec:
                p = {
                    "name": rec.name,
                    "headline": rec.headline,
                    "email": rec.email,
                    "location": rec.location,
                    "skills": rec.skills or [],
                    "projects": rec.projects or [],
                    "experience": rec.experience or [],
                    "years": rec.years or 2,
                    "target_roles": rec.target_roles or ["all"],
                    "target_companies": rec.target_companies or ["all"],
                    "work_types": rec.work_types or ["fulltime", "remote"],
                    "evidence": rec.evidence or []
                }
        finally:
            db.close()
    updated = recommendations.apply_recommendation_to_profile(b.rec_changes, p)
    return {"ok": True, "profile": updated}
