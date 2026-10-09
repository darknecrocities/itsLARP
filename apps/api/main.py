from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dataclasses import asdict
from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import httpx

from services import scoring, verification, dedupe, notion, jobs, tailoring, swarm, resume_parser
from services.ai_gateway import ai_gateway
from services.database import init_db, SessionLocal, JobRecord, ApplicationRecord, ProfileRecord

init_db()

app = FastAPI(title="HowToLarped API - AI Job-Hunting Workforce")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "HowToLarped API", "time": datetime.utcnow().isoformat()}


# --- AI Configuration & Status ---

@app.get("/ai/status")
async def ai_status():
    return await ai_gateway.get_status()


class AIConfigIn(BaseModel):
    provider: str
    model: str
    api_key: Optional[str] = None


@app.post("/ai/configure")
def ai_configure(b: AIConfigIn):
    ai_gateway.set_config(b.provider, b.model, b.api_key)
    return {"ok": True, "provider": ai_gateway.provider, "model": ai_gateway.model}


# --- Resume Parsing & Profile ---

@app.post("/profile/parse-resume")
async def parse_resume_upload(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "uploaded_resume"
    if filename.lower().endswith(".pdf"):
        try:
            text = resume_parser.extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(400, f"Could not read PDF resume: {str(e)}")
    else:
        try:
            text = content.decode("utf-8", errors="ignore")
        except Exception:
            text = str(content)
    if not text.strip():
        raise HTTPException(400, "The uploaded file contains no readable text.")
    parsed = resume_parser.parse_resume_content(text, filename)
    return parsed


class ProfileIn(BaseModel):
    profile: dict


@app.post("/profile/save")
def profile_save(b: ProfileIn):
    p = b.profile
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if not rec:
            rec = ProfileRecord(id="default")
            db.add(rec)
        rec.name = p.get("name", "")
        rec.headline = p.get("headline", "")
        rec.email = p.get("email", "")
        rec.location = p.get("location", "")
        rec.years = p.get("years", 0)
        rec.education = p.get("education", "")
        rec.skills = p.get("skills", [])
        rec.experience = p.get("experience", [])
        rec.projects = p.get("projects", [])
        rec.links = p.get("links", {})
        rec.evidence = p.get("evidence", [])
        db.commit()
        return {"ok": True}
    finally:
        db.close()


@app.get("/profile")
def profile_get():
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if not rec:
            return {"profile": None}
        return {
            "profile": {
                "name": rec.name,
                "headline": rec.headline,
                "email": rec.email,
                "location": rec.location,
                "years": rec.years,
                "education": rec.education,
                "skills": rec.skills or [],
                "experience": rec.experience or [],
                "projects": rec.projects or [],
                "links": rec.links or {},
                "evidence": rec.evidence or [],
            }
        }
    finally:
        db.close()


# --- Job Discovery & Intelligence ---

class SearchIn(BaseModel):
    query: str = ""
    remote: bool = False
    profile: dict = {}


@app.post("/jobs/search")
async def jobs_search(b: SearchIn):
    found, errs = await jobs.discover(b.query.strip()[:80])
    if b.remote:
        found = [j for j in found if j.get("remote", True)]
    if b.profile.get("skills"):
        for j in found:
            j["match"] = tailoring.match(b.profile, j)
        found.sort(key=lambda j: -j.get("match", {}).get("score", 0))
    return {
        "jobs": [{k: v for k, v in j.items() if k != "description"} | {"description": j.get("description", "")[:800]} for j in found[:100]],
        "errors": errs
    }


class ImportJobIn(BaseModel):
    url: str = ""
    title: str = ""
    company: str = ""
    description: str = ""
    profile: dict = {}


@app.post("/jobs/import-url")
async def jobs_import_url(b: ImportJobIn):
    j = await jobs.import_custom_job(url=b.url, title=b.title, company=b.company, raw_text=b.description)
    if b.profile.get("skills"):
        j["match"] = tailoring.match(b.profile, j)
    return j


@app.get("/jobs/{job_id}")
def job_get(job_id: str):
    j = jobs.get_job(job_id)
    if not j:
        raise HTTPException(404, "Job not found. Search again to refresh listings.")
    return j


# --- Match Scoring & Claim Verification ---

class MatchIn(BaseModel):
    candidate: dict
    job: dict
    embedding_sim: float = 0.0


@app.post("/match")
def match_endpoint(body: MatchIn):
    return asdict(scoring.score_match(body.candidate, body.job, body.embedding_sim))


class VerifyIn(BaseModel):
    text: str
    evidence: list[dict]


@app.post("/verify")
def verify_endpoint(body: VerifyIn):
    return verification.verify(body.text, body.evidence)


# --- Applications & Tailoring ---

class PrepIn(BaseModel):
    profile: dict
    job_id: str


@app.post("/applications/prepare")
async def prepare_application(b: PrepIn):
    j = jobs.get_job(b.job_id)
    if not j:
        raise HTTPException(404, "Job not found. Search again to refresh listings.")
    return await tailoring.prepare(b.profile, j)


class ApproveIn(BaseModel):
    job_id: str
    company: str
    role: str
    match: int = 0
    resume: str = ""
    cover: str = ""
    answers: dict = {}
    verified: bool = True


@app.post("/applications/approve")
def approve_application(b: ApproveIn):
    app_id = f"a-{b.job_id}"
    db = SessionLocal()
    try:
        rec = db.query(ApplicationRecord).filter(ApplicationRecord.id == app_id).first()
        now_iso = datetime.utcnow().isoformat()
        if not rec:
            rec = ApplicationRecord(
                id=app_id,
                job_id=b.job_id,
                company=b.company,
                role=b.role,
                match=b.match,
                status="APPLIED",
                resume=b.resume,
                cover=b.cover,
                answers=b.answers,
                verified=b.verified,
                events=[{"at": now_iso, "text": "Approved by user and marked APPLIED"}]
            )
            db.add(rec)
        else:
            rec.status = "APPLIED"
            rec.resume = b.resume
            rec.cover = b.cover
            rec.answers = b.answers
            evs = rec.events or []
            rec.events = [{"at": now_iso, "text": "Application updated and approved"}] + evs
        db.commit()
        return {"ok": True, "id": app_id, "status": rec.status}
    finally:
        db.close()


@app.get("/applications")
def applications_list():
    db = SessionLocal()
    try:
        recs = db.query(ApplicationRecord).order_by(ApplicationRecord.updated_at.desc()).all()
        return [
            {
                "id": r.id,
                "jobId": r.job_id,
                "company": r.company,
                "role": r.role,
                "match": r.match,
                "status": r.status,
                "resume": r.resume,
                "cover": r.cover,
                "answers": r.answers or {},
                "verified": r.verified,
                "events": r.events or []
            }
            for r in recs
        ]
    finally:
        db.close()


class StatusUpdateIn(BaseModel):
    status: str
    notes: Optional[str] = None


@app.patch("/applications/{app_id}")
def application_update_status(app_id: str, b: StatusUpdateIn):
    db = SessionLocal()
    try:
        rec = db.query(ApplicationRecord).filter(ApplicationRecord.id == app_id).first()
        if not rec:
            raise HTTPException(404, "Application not found")
        old_status = rec.status
        rec.status = b.status
        evs = rec.events or []
        note_text = f" ({b.notes})" if b.notes else ""
        rec.events = [{"at": datetime.utcnow().isoformat(), "text": f"Status updated: {old_status} → {b.status}{note_text}"}] + evs
        db.commit()
        return {"ok": True, "id": app_id, "status": rec.status}
    finally:
        db.close()


# --- Agent Workforce Swarm ---

class SwarmIn(BaseModel):
    profile: dict
    queries: list[str] = Field(min_length=1, max_length=10)
    workers: int = Field(ge=1, le=1000)


@app.post("/swarm/start")
def swarm_start(b: SwarmIn):
    run = swarm.Run(b.profile, [q[:80] for q in b.queries], b.workers)
    swarm.RUNS[run.id] = run
    run.start()
    return run.snapshot()


@app.get("/swarm/{run_id}")
def swarm_get(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    return run.snapshot()


@app.post("/swarm/{run_id}/stop")
def swarm_stop(run_id: str):
    run = swarm.RUNS.get(run_id)
    if not run:
        raise HTTPException(404, "Swarm run not found.")
    run.stop()
    return run.snapshot()


@app.get("/swarm/{run_id}/results")
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


# --- Analytics ---

@app.get("/analytics")
def analytics_get():
    db = SessionLocal()
    try:
        apps = db.query(ApplicationRecord).all()
        sent = [a for a in apps if a.status not in ["SAVED", "ANALYZING", "PREPARING", "READY"]]
        total = len(sent)
        resp = len([a for a in sent if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]])
        interviews = len([a for a in sent if a.status in ["INTERVIEW", "OFFER"]])
        offers = len([a for a in sent if a.status == "OFFER"])

        # Role performance breakdown
        roles: dict[str, dict] = {}
        for a in sent:
            key = "AI / ML" if any(w in a.role.lower() for w in ["ai", "ml", "learning"]) else "Software / Backend" if any(w in a.role.lower() for w in ["backend", "software", "web"]) else "Other"
            if key not in roles:
                roles[key] = {"applied": 0, "responses": 0, "interviews": 0}
            roles[key]["applied"] += 1
            if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]:
                roles[key]["responses"] += 1
            if a.status in ["INTERVIEW", "OFFER"]:
                roles[key]["interviews"] += 1

        recommendation = "Target more AI-focused roles where candidate skills show 85%+ technical compatibility." if roles.get("AI / ML", {}).get("applied", 0) >= 1 else "Build more applications to generate statistical conversion insights."

        return {
            "total_applications": total,
            "response_rate": round(100 * resp / max(1, total), 1),
            "interview_rate": round(100 * interviews / max(1, total), 1),
            "offer_rate": round(100 * offers / max(1, total), 1),
            "roles": roles,
            "recommendation": recommendation
        }
    finally:
        db.close()


# --- Notion Integration ---

class NotionToken(BaseModel):
    token: str = Field(min_length=10)


class NotionSync(NotionToken):
    database_id: str
    application: dict


class NotionDb(NotionToken):
    parent_page_id: str


@app.post("/integrations/notion/test")
async def notion_test(b: NotionToken):
    return await notion.test_connection(b.token)


@app.post("/integrations/notion/database")
async def notion_db(b: NotionDb):
    try:
        return await notion.create_database(b.token, b.parent_page_id)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion request failed. Check your token and page permissions.")


@app.post("/integrations/notion/sync")
async def notion_sync(b: NotionSync):
    try:
        return await notion.sync_application(b.token, b.database_id, b.application)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion sync failed. Check database access permissions.")
