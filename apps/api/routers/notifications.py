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
    important_only: bool = False,
    category: Optional[str] = None,
    limit: int = 50
):
    """Returns recent device/desktop activity notifications with priority anti-spam filtering."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec or not rec.settings:
            return {"ok": True, "notifications": [], "unread_count": 0}

        notifs = list(rec.settings.get("device_notifications") or [])

        # Filter by priority if requested
        if important_only:
            notifs = [n for n in notifs if n.get("priority") in ("urgent", "high")]

        if unread_only:
            notifs = [n for n in notifs if not n.get("read", False)]

        if category:
            if category == "recruiter":
                notifs = [n for n in notifs if "recruiter" in n.get("event_type", "")]
            elif category == "swarm":
                notifs = [n for n in notifs if "swarm" in n.get("event_type", "") or "application" in n.get("event_type", "")]
            elif category == "remote":
                notifs = [n for n in notifs if "remote" in n.get("event_type", "") or "command" in n.get("event_type", "")]

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


@router.post("/clear")
def clear_all_notifications():
    """Clears device notifications history."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if rec and rec.settings:
            settings = dict(rec.settings)
            settings["device_notifications"] = []
            rec.settings = settings
            flag_modified(rec, "settings")
            db.commit()
        return {"ok": True, "message": "All notifications cleared"}
    finally:
        db.close()


class TestNotificationIn(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[str] = None
    event_type: Optional[str] = None
    link_url: Optional[str] = None


@router.post("/test")
def emit_test_notification(b: Optional[TestNotificationIn] = None):
    """Generates a dynamic real-time notification from active profile and applications."""
    import random
    from services.database import ApplicationRecord
    body = b or TestNotificationIn()
    db = SessionLocal()
    try:
        prof = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        cand_name = prof.name if (prof and prof.name) else "Candidate"
        cand_email = prof.email if (prof and prof.email) else email_monitor.DEFAULT_CANDIDATE_EMAIL

        # Look up real application from database (Notion-synced or local)
        apps = db.query(ApplicationRecord).order_by(ApplicationRecord.updated_at.desc()).limit(15).all()
        selected_app = random.choice(apps) if apps else None

        now_id = f"notif-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
        default_link = f"/notifications?id={now_id}"

        if selected_app:
            co = selected_app.company
            ro = selected_app.role
            match_pct = selected_app.match or 92
            event_type = body.event_type or "recruiter_interview"
            title = body.title or f"🎉 Recruiter Interview: {co}"
            message = body.message or f"{co} reviewed {cand_name}'s application for {ro} (Match: {match_pct}%) and requested an interview."
            priority = body.priority or "urgent"
            link_url = body.link_url or default_link
        else:
            target_role = (prof.target_roles[0] if (prof and prof.target_roles) else None) or "Lead AI Systems Engineer"
            target_co = (prof.target_companies[0] if (prof and prof.target_companies and prof.target_companies[0] != "all") else None) or "Scale AI"
            event_type = body.event_type or "swarm_applied"
            title = body.title or f"🚀 Swarm Application: {target_co}"
            message = body.message or f"Autonomous Bot applied for {target_role} at {target_co} with verified APA resume."
            priority = body.priority or "high"
            link_url = body.link_url or default_link

        item = email_monitor.record_device_notification(
            db=db,
            event_type=event_type,
            title=title,
            message=message,
            recipient=cand_email,
            priority=priority,
            link_url=link_url,
            tag=f"{event_type}:{now_id}",
        )
        return {"ok": True, "notification": item}
    finally:
        db.close()
