from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
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
    force_reapply: bool = False


ONGOING_STATUSES = {"PREPARING", "READY", "APPLIED", "SCREENING", "INTERVIEW", "OFFER"}
TERMINAL_STATUSES = {"REJECTED", "WITHDRAWN"}


@router.get("/check")
def check_application_duplicate(job_id: Optional[str] = None, company: Optional[str] = None, role: Optional[str] = None):
    """Check if user has already applied to this job or company/role to prevent duplicate applications."""
    db = SessionLocal()
    try:
        rec = None
        if job_id:
            rec = db.query(ApplicationRecord).filter(
                (ApplicationRecord.job_id == job_id) | (ApplicationRecord.id == f"a-{job_id}")
            ).first()

        if not rec and company and role:
            from services.dedupe import _norm
            norm_c = _norm(company)
            norm_r = _norm(role)
            for candidate in db.query(ApplicationRecord).all():
                if _norm(candidate.company) == norm_c and _norm(candidate.role) == norm_r:
                    rec = candidate
                    break

        if not rec:
            return {"has_application": False, "can_apply": True}

        is_ongoing = rec.status in ONGOING_STATUSES
        is_terminal = rec.status in TERMINAL_STATUSES
        can_reapply = is_terminal or rec.status == "REJECTED"

        message = (
            f"Already applied to {rec.company} ({rec.role}). Current status: {rec.status}."
            if is_ongoing else
            f"Previous application was marked as {rec.status}. You are eligible to re-apply."
        )

        return {
            "has_application": True,
            "app_id": rec.id,
            "status": rec.status,
            "is_ongoing": is_ongoing,
            "is_terminal": is_terminal,
            "can_reapply": can_reapply,
            "applied_date": getattr(rec, "applied_date", "") or (rec.created_at.strftime("%Y-%m-%d") if rec.created_at else ""),
            "events": rec.events or [],
            "message": message,
            "notion_page_id": getattr(rec, "notion_page_id", None)
        }
    finally:
        db.close()


@router.post("/approve")
def approve_application(b: ApproveIn):
    app_id = f"a-{b.job_id}"
    db = SessionLocal()
    try:
        rec = db.query(ApplicationRecord).filter(
            (ApplicationRecord.id == app_id) | (ApplicationRecord.job_id == b.job_id)
        ).first()

        now_iso = datetime.now(timezone.utc).isoformat()
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Duplicate check: If application is already ongoing and user didn't force re-apply
        if rec and rec.status in ONGOING_STATUSES and not b.force_reapply:
            return {
                "ok": False,
                "duplicate": True,
                "app_id": rec.id,
                "status": rec.status,
                "message": f"Duplicate application prevented: You already have an active application ({rec.status}) for {rec.company}. If you want to re-apply, choose 'Re-Apply'."
            }

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
                applied_date=today_str,
                events=[{"at": now_iso, "text": "Application submitted & marked APPLIED"}]
            )
            db.add(rec)
        else:
            old_status = rec.status
            rec.status = "APPLIED"
            rec.resume = b.resume or rec.resume
            rec.cover = b.cover or rec.cover
            rec.answers = b.answers or rec.answers
            rec.applied_date = today_str
            evs = rec.events or []
            action_desc = f"Re-applied to position (previously {old_status})" if b.force_reapply or old_status in TERMINAL_STATUSES else "Application updated and approved"
            rec.events = [{"at": now_iso, "text": action_desc}] + evs

        db.commit()
        return {"ok": True, "id": rec.id, "status": rec.status, "message": "Application submitted successfully."}
    finally:
        db.close()


@router.post("/{app_id}/reapply")
def application_reapply(app_id: str):
    """Allows user to re-apply if previous status was REJECTED, WITHDRAWN, or if desired."""
    db = SessionLocal()
    try:
        rec = db.query(ApplicationRecord).filter(ApplicationRecord.id == app_id).first()
        if not rec:
            raise HTTPException(404, "Application not found")

        old_status = rec.status
        rec.status = "READY"
        now_iso = datetime.now(timezone.utc).isoformat()
        evs = rec.events or []
        rec.events = [{"at": now_iso, "text": f"User initiated Re-Application (Previous status: {old_status})"}] + evs
        db.commit()

        return {
            "ok": True,
            "id": app_id,
            "status": rec.status,
            "message": f"Re-application initiated for {rec.company}. Fresh tailored package is ready for review."
        }
    finally:
        db.close()


@router.get("")
@router.post("")
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
                "platform": getattr(r, "platform", "Direct"),
                "url": getattr(r, "url", ""),
                "notionPageId": getattr(r, "notion_page_id", None),
                "notionDatabaseId": getattr(r, "notion_database_id", None),
                "appliedDate": getattr(r, "applied_date", "") or (r.created_at.strftime("%Y-%m-%d") if r.created_at else ""),
                "resume": r.resume,
                "cover": r.cover,
                "answers": r.answers or {},
                "verified": r.verified,
                "events": r.events or [],
                "canReapply": r.status in TERMINAL_STATUSES or r.status == "REJECTED",
                "isOngoing": r.status in ONGOING_STATUSES,
            }
            for r in recs
        ]
    finally:
        db.close()


class StatusUpdateIn(BaseModel):
    status: str
    notes: Optional[str] = None


@router.patch("/{app_id}")
async def application_update_status(app_id: str, b: StatusUpdateIn):
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

        # If connected to Notion and has notion_page_id, update Notion page in background
        if getattr(rec, "notion_page_id", None):
            from services.database import IntegrationRecord
            from services import notion
            integ = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
            if integ and integ.connected and integ.token:
                try:
                    await notion.update_page_status(integ.token, rec.notion_page_id, b.status)
                except Exception:
                    pass

        return {"ok": True, "id": app_id, "status": rec.status}
    finally:
        db.close()


@router.post("/clear")
def applications_clear():
    """Clear all locally tracked applications."""
    db = SessionLocal()
    try:
        deleted = db.query(ApplicationRecord).delete()
        db.commit()
        return {"ok": True, "deleted_count": deleted}
    finally:
        db.close()


