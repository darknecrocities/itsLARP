from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from services import jobs, tailoring
from services.database import SessionLocal, ApplicationRecord

router = APIRouter(prefix="/applications", tags=["applications"])


class PrepIn(BaseModel):
    profile: dict
    job_id: str


@router.post("/prepare")
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


@router.post("/approve")
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


@router.get("")
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


@router.patch("/{app_id}")
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
