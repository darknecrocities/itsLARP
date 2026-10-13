from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services import swarm

router = APIRouter(prefix="/swarm", tags=["swarm"])


class SwarmIn(BaseModel):
    profile: dict
    queries: list[str] = Field(min_length=1, max_length=10)
    workers: int = Field(ge=1, le=1000)


@router.post("/start")
def swarm_start(b: SwarmIn):
    run = swarm.Run(b.profile, [q[:80] for q in b.queries], b.workers)
    swarm.RUNS[run.id] = run
    run.start()
    return run.snapshot()


@router.get("/{run_id}")
def swarm_get(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
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
            "cover": (r.get("package") or {}).get("cover", "")
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
