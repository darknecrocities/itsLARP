import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services import swarm

router = APIRouter(prefix="/swarm", tags=["swarm"])


class SwarmIn(BaseModel):
    profile: Optional[dict] = None
    queries: Optional[list[str]] = None
    workers: int = Field(ge=1, le=50000, default=1000)
    batch_size: Optional[int] = None
    credentials: Optional[dict] = None
    target_jobs: int = Field(ge=1, le=50000, default=100)
    target_roles: Optional[list[str]] = None
    target_companies: Optional[list[str]] = None
    work_types: Optional[list[str]] = None
    app_config: Optional[dict] = None
    guardrail: Optional[dict] = None
    guardrails: Optional[dict] = None


@router.post("/start")
async def swarm_start(b: SwarmIn):
    profile = b.profile
    if not profile:
        from services.database import SessionLocal, ProfileRecord
        db = SessionLocal()
        try:
            rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
            if rec:
                profile = {
                    "name": rec.name,
                    "headline": rec.headline,
                    "email": rec.email,
                    "phone": rec.phone or "",
                    "location": rec.location,
                    "years": rec.years or 0,
                    "education": rec.education or "",
                    "summary": rec.summary or "",
                    "target_roles": rec.target_roles or ["all"],
                    "target_companies": rec.target_companies or ["all"],
                    "work_types": rec.work_types or ["fulltime", "remote"],
                    "skills": rec.skills or [],
                    "experience": rec.experience or [],
                    "projects": rec.projects or [],
                    "links": rec.links or {},
                    "evidence": rec.evidence or [],
                }
        finally:
            db.close()
    profile = profile or {"name": "Taylor Morgan", "headline": "Principal AI Systems Architect", "skills": ["python", "pytorch", "kubernetes", "fastapi"]}
    queries = b.queries or ["AI Systems Engineer", "Principal AI Architect"]
    workers = b.batch_size if b.batch_size is not None else b.workers
    target_jobs = b.batch_size if b.batch_size is not None else b.target_jobs
    app_config = dict(b.app_config or {})
    if b.guardrail:
        app_config.update(b.guardrail)
    if b.guardrails:
        app_config.update(b.guardrails)

    run = swarm.Run(
        profile,
        [q[:80] for q in queries],
        workers=workers,
        credentials=b.credentials,
        target_jobs=target_jobs,
        target_roles=b.target_roles,
        target_companies=b.target_companies,
        work_types=b.work_types,
        app_config=app_config,
    )
    swarm.RUNS[run.id] = run
    run.start()
    await asyncio.sleep(0.05)
    return run.snapshot()


@router.get("/status")
async def swarm_status():
    if not swarm.RUNS:
        return {
            "status": "idle",
            "active_run": None,
            "stages": ["Discovery", "Matchmaker", "Tailoring", "Verification", "Screening", "Application Dispatcher"],
        }
    latest_run = list(swarm.RUNS.values())[-1]
    snap = latest_run.snapshot()
    snap["stages"] = ["Discovery", "Matchmaker", "Tailoring", "Verification", "Screening", "Application Dispatcher"]
    snap["parallel_execution"] = {
        "Discovery": {"status": "active" if snap["pools"]["scrapers_active"] > 0 else "completed", "active_workers": snap["pools"]["scrapers_active"], "total_pool": snap["pools"]["scrapers_count"]},
        "Matchmaker": {"status": "processing" if snap["counts"]["matching"]["queued"] > 0 else "completed", "done": snap["counts"]["matching"]["done"], "queued": snap["counts"]["matching"]["queued"]},
        "Tailoring": {"status": "active" if snap["pools"]["tailors_active"] > 0 else "completed", "active_workers": snap["pools"]["tailors_active"], "total_pool": snap["pools"]["tailors_count"]},
        "Verification": {"status": "completed", "done": snap["counts"]["resumes"]["done"], "blocked": snap["blocked"]},
        "Screening": {"status": "completed", "done": snap["counts"]["resumes"]["done"]},
        "Application Dispatcher": {"status": "active" if snap["pools"]["appliers_active"] > 0 else "completed", "active_workers": snap["pools"]["appliers_active"], "applied": snap["applied"], "total_pool": snap["pools"]["appliers_count"]},
    }
    return snap


@router.get("/{run_id}")
async def swarm_get(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    if run.status == "running":
        await asyncio.sleep(0.25)
    return run.snapshot()


@router.post("/{run_id}/stop")
def swarm_stop(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    run.stop()
    return run.snapshot()


@router.get("/{run_id}/results")
def swarm_results(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    rows = [
        {
            "job": {k: v for k, v in r["job"].items() if k != "description"},
            "match": r.get("match"),
            "state": r.get("state"),
            "blocked": (r.get("package") or {}).get("verification", {}).get("blocked", 0),
            "cover": (r.get("package") or {}).get("cover", ""),
            "resume_format": (r.get("package") or {}).get("resume_format_label", "APA 7th Edition"),
            "resume_text": (r.get("package") or {}).get("resume_text", ""),
            "app_id": r.get("app_id", ""),
        }
        for r in run.results.values()
    ]
    rows.sort(key=lambda r: -(r.get("match") or {}).get("score", 0))
    return rows[:200]


@router.get("/{run_id}/bots")
def swarm_bots(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    return {
        "run_id": run.id,
        "status": run.status,
        "active": run.active,
        "bots": run.get_all_bots()
    }


@router.get("/{run_id}/bots/{bot_id}")
def swarm_bot_detail(run_id: str, bot_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    bot = run.get_bot(bot_id)
    if not bot:
        raise HTTPException(404, f"Bot {bot_id} not found in this run.")
    return bot


class VerifyBotIn(BaseModel):
    code: str = ""


@router.post("/{run_id}/bots/{bot_id}/verify")
def swarm_bot_verify(run_id: str, bot_id: str, b: VerifyBotIn):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    success = run.verify_bot(bot_id, b.code)
    return {"ok": success, "bot_id": bot_id}
