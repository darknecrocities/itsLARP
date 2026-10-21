from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm.attributes import flag_modified
from services import swarm
from services import email_monitor
from services.database import SessionLocal, ProfileRecord, AgentQuestionRecord, IntegrationRecord

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/questions")
def get_pending_questions():
    db = SessionLocal()
    try:
        recs = db.query(AgentQuestionRecord).filter(
            AgentQuestionRecord.status == "pending"
        ).order_by(AgentQuestionRecord.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "run_id": r.run_id,
                "bot_id": r.bot_id,
                "job_id": r.job_id,
                "company": r.company,
                "role": r.role,
                "question": r.question,
                "context": r.context,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else ""
            }
            for r in recs
        ]
    finally:
        db.close()


class AnswerQuestionIn(BaseModel):
    answer: str


@router.post("/questions/{question_id}/answer")
def answer_question(question_id: str, b: AnswerQuestionIn):
    db = SessionLocal()
    try:
        q_rec = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == question_id).first()
        if not q_rec:
            raise HTTPException(404, "Question not found")
        q_rec.status = "answered"
        q_rec.answer = b.answer
        q_rec.answered_at = datetime.now(timezone.utc)

        p_rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if p_rec:
            evs = list(p_rec.evidence or [])
            evs.append({
                "source": f"Candidate Clarification ({q_rec.company})",
                "text": f"Question: {q_rec.question} | Candidate Response: {b.answer}"
            })
            p_rec.evidence = evs

        db.commit()

        for run in swarm.RUNS.values():
            if q_rec.bot_id in run.bots:
                bot = run.bots[q_rec.bot_id]
                bot.status = "completed"
                bot.current_task = f"Answer received: '{b.answer[:30]}...'. Application ready for review."
            run.pending_questions = [q for q in run.pending_questions if q.get("id") != question_id]

        return {"ok": True, "question_id": question_id, "evidence_added": True}
    finally:
        db.close()


@router.post("/questions/{question_id}/dismiss")
def dismiss_question(question_id: str):
    db = SessionLocal()
    try:
        q_rec = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == question_id).first()
        if q_rec:
            q_rec.status = "dismissed"
            db.commit()
        for run in swarm.RUNS.values():
            run.pending_questions = [q for q in run.pending_questions if q.get("id") != question_id]
        return {"ok": True}
    finally:
        db.close()


@router.get("/feed")
def get_notification_feed(
    unread_only: bool = False,
    important_only: bool = True,
    limit: int = 25
):
    """Returns recent device/desktop activity notifications with priority anti-spam filtering."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec or not rec.settings:
            return {"ok": True, "notifications": [], "unread_count": 0}

        notifs = list(rec.settings.get("device_notifications") or [])

        # Priority filtering to prevent spamming
        if important_only:
            notifs = [n for n in notifs if n.get("priority") in ("urgent", "high")]

        if unread_only:
            notifs = [n for n in notifs if not n.get("read", False)]

        unread_count = sum(1 for n in (rec.settings.get("device_notifications") or []) if not n.get("read", False))

        return {
            "ok": True,
            "notifications": notifs[:limit],
            "unread_count": unread_count,
            "important_only": important_only,
        }
    finally:
        db.close()


class MarkReadIn(BaseModel):
    ids: Optional[List[str]] = None


@router.post("/read")
def mark_notifications_read(b: Optional[MarkReadIn] = None):
    """Marks specific notifications as read."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec or not rec.settings:
            return {"ok": True, "updated": 0}

        settings = dict(rec.settings)
        notifs = list(settings.get("device_notifications") or [])
        target_ids = set(b.ids) if (b and b.ids) else None

        updated_count = 0
        for n in notifs:
            if target_ids is None or n.get("id") in target_ids:
                if not n.get("read", False):
                    n["read"] = True
                    updated_count += 1

        settings["device_notifications"] = notifs
        rec.settings = settings
        flag_modified(rec, "settings")
        db.commit()

        return {"ok": True, "updated": updated_count}
    finally:
        db.close()


@router.post("/read-all")
def mark_all_notifications_read():
    """Marks all stored notifications as read."""
    return mark_notifications_read(None)


class TestNotificationIn(BaseModel):
    title: Optional[str] = "🎉 Interview Request: Askable"
    message: Optional[str] = "Recruiter invitation to technical round received for Senior Frontend Role."
    priority: Optional[str] = "urgent"
    event_type: Optional[str] = "recruiter_interview"
    link_url: Optional[str] = "/applications"


@router.post("/test")
def emit_test_notification(b: Optional[TestNotificationIn] = None):
    """Generates an immediate test notification to verify OS and desktop toast dispatch."""
    body = b or TestNotificationIn()
    db = SessionLocal()
    try:
        item = email_monitor.record_device_notification(
            db=db,
            event_type=body.event_type or "recruiter_interview",
            title=body.title or "🎉 Interview Request: Askable",
            message=body.message or "Invitation to technical screening received.",
            priority=body.priority or "urgent",
            link_url=body.link_url or "/applications",
        )
        return {"ok": True, "notification": item}
    finally:
        db.close()
